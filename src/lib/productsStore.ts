import { products as defaultProducts } from "@/data/products";
import type { Product } from "@/context/ProductContext";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { slugToProductCategory } from "@/lib/catalogHelpers";
import { loadCatalog } from "@/lib/catalogStore";

const STORAGE_KEY = "colour_seven_products";
const PRODUCTS_CUSTOMIZED_KEY = "colour_seven_products_customized";

let memoryCache: Product[] | null = null;

function markProductsCustomized() {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRODUCTS_CUSTOMIZED_KEY, "1");
}

function isProductsCustomized(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRODUCTS_CUSTOMIZED_KEY) === "1";
}

function readLocalProducts(): Product[] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return null;
  }
}

function writeLocalProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  memoryCache = products;
}

function buildDefaultProducts(): Product[] {
  return defaultProducts.map((p) => ({
    ...p,
    brand: p.brand || "Colour Seven",
  }));
}

function loadLocalProducts(): Product[] {
  if (memoryCache) return memoryCache;

  const stored = readLocalProducts();
  if (stored !== null) {
    memoryCache = stored;
    return stored;
  }

  if (isProductsCustomized()) {
    memoryCache = [];
    return [];
  }

  const defaults = buildDefaultProducts();
  writeLocalProducts(defaults);
  return defaults;
}

async function fetchRemoteProducts(): Promise<Product[] | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      discount_price,
      original_price,
      featured,
      full_description,
      short_description,
      brands ( name ),
      categories ( slug )
    `
    );

  if (error) {
    console.error("Supabase products fetch failed:", error);
    return null;
  }

  if (!data?.length) return [];

  return data.map((row) => {
    const r = row as Record<string, unknown>;
    const brandObj = r.brands as { name?: string } | null;
    const catObj = r.categories as { slug?: string } | null;
    const slug = catObj?.slug || "accessories";

    return {
      id: String(r.id),
      name: String(r.name),
      brand: brandObj?.name || "Colour Seven",
      price: Number(r.discount_price) || Number(r.original_price) || 0,
      category: slugToProductCategory(slug),
      images: ["/images/chrono_watch.png"],
      description: String(r.full_description || r.short_description || ""),
      sizes: ["One Size"],
      colors: ["Default"],
      isNew: Boolean(r.featured),
    };
  });
}

export async function loadProducts(force = false): Promise<Product[]> {
  if (memoryCache && !force) return memoryCache;

  if (isSupabaseConfigured) {
    const remote = await fetchRemoteProducts();
    if (remote !== null) {
      if (remote.length > 0) {
        writeLocalProducts(remote);
        return remote;
      }
      invalidateProductsCache();
      const local = loadLocalProducts();
      if (isProductsCustomized() || local.length > 0) {
        return local;
      }
      writeLocalProducts(remote);
      return remote;
    }
  }

  return loadLocalProducts();
}

export function getProductsSync(): Product[] {
  return loadLocalProducts();
}

export function invalidateProductsCache() {
  memoryCache = null;
}

export async function refreshProducts(): Promise<Product[]> {
  invalidateProductsCache();
  return loadProducts(true);
}

export async function addProduct(product: Omit<Product, "id">): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id: `${Date.now()}${Math.random().toString(36).slice(2, 9)}`,
  };

  if (supabase) {
    const catalog = await loadCatalog();
    const category = catalog.categories.find(
      (c) => slugToProductCategory(c.slug) === product.category
    );
    const brand = catalog.brands.find(
      (b) => b.name === product.brand && b.category_id === category?.slug
    );

    if (category && brand) {
      const { data: catRow } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", category.slug)
        .maybeSingle();
      const { data: brandRow } = await supabase
        .from("brands")
        .select("id")
        .eq("slug", brand.slug)
        .maybeSingle();

      if (catRow?.id && brandRow?.id) {
        const slug = product.name.toLowerCase().replace(/\s+/g, "-");
        const { data, error } = await supabase
          .from("products")
          .insert({
            category_id: catRow.id,
            brand_id: brandRow.id,
            name: product.name,
            slug: `${slug}-${Date.now()}`,
            short_description: product.description.slice(0, 200),
            full_description: product.description,
            sku: `SKU-${Date.now()}`,
            original_price: product.price,
            discount_price: product.price,
            featured: product.isNew,
            is_active: true,
          })
          .select("id")
          .single();

        if (!error && data?.id) {
          newProduct.id = String(data.id);
          if (product.images[0]) {
            await supabase.from("product_images").insert({
              product_id: data.id,
              image_url: product.images[0],
              display_order: 0,
              is_main: true,
            });
          }
          await refreshProducts();
          markProductsCustomized();
          return newProduct;
        }
      }
    }
  }

  const list = loadLocalProducts();
  markProductsCustomized();
  writeLocalProducts([...list, newProduct]);
  return newProduct;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<void> {
  if (supabase) {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.price !== undefined) {
      payload.discount_price = updates.price;
      payload.original_price = updates.price;
    }
    if (updates.description !== undefined) {
      payload.full_description = updates.description;
      payload.short_description = updates.description.slice(0, 200);
    }
    if (updates.isNew !== undefined) payload.featured = updates.isNew;

    if (Object.keys(payload).length > 0) {
      const { error } = await supabase.from("products").update(payload).eq("id", id);
      if (error) throw error;
    }
    await refreshProducts();
    markProductsCustomized();
    return;
  }

  const list = loadLocalProducts();
  markProductsCustomized();
  writeLocalProducts(
    list.map((p) => (p.id === id ? { ...p, ...updates } : p))
  );
}

export async function deleteProduct(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    await refreshProducts();
    markProductsCustomized();
    return;
  }

  const list = loadLocalProducts();
  markProductsCustomized();
  writeLocalProducts(list.filter((p) => p.id !== id));
}

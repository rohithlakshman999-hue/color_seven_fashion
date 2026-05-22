import { products as defaultProducts } from "@/data/products";
import type { Product } from "@/context/ProductContext";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { slugToProductCategory } from "@/lib/catalogHelpers";
import { loadCatalog } from "@/lib/catalogStore";

const STORAGE_KEY = "colour_seven_products";
const PRODUCTS_CUSTOMIZED_KEY = "colour_seven_products_customized";

let memoryCache: Product[] | null = null;

function buildDefaultProducts(): Product[] {
  return defaultProducts.map((p) => ({
    ...p,
    brand: p.brand || "Colour Seven",
  }));
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
      tags,
      brands ( name ),
      categories ( slug ),
      product_images ( image_url, display_order ),
      product_variants ( size, color )
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

    const rawImages = r.product_images as { image_url: string; display_order?: number }[] | null;
    let images: string[] = [];
    if (rawImages && Array.isArray(rawImages)) {
      const sorted = [...rawImages].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
      images = sorted.map((img) => img.image_url);
    }
    if (images.length === 0) {
      images = ["/images/chrono_watch.png"];
    }

    const rawVariants = r.product_variants as { size?: string; color?: string }[] | null;
    const sizesSet = new Set<string>();
    const colorsSet = new Set<string>();
    if (rawVariants && Array.isArray(rawVariants)) {
      rawVariants.forEach((v) => {
        if (v.size) sizesSet.add(v.size);
        if (v.color) colorsSet.add(v.color);
      });
    }
    const sizes = sizesSet.size > 0 ? Array.from(sizesSet) : ["One Size"];
    const colors = colorsSet.size > 0 ? Array.from(colorsSet) : ["Default"];

    const rawTags = r.tags as string[] | null;
    const isTrending = Array.isArray(rawTags) && rawTags.includes("trending");

    return {
      id: String(r.id),
      name: String(r.name),
      brand: brandObj?.name || "Colour Seven",
      price: Math.round(Number(r.discount_price) || Number(r.original_price) || 0),
      category: slugToProductCategory(slug),
      images,
      description: String(r.full_description || r.short_description || ""),
      sizes,
      colors,
      isNew: Boolean(r.featured),
      isTrending,
    };
  });
}

async function migrateLocalProductsToSupabase() {
  if (typeof window === "undefined" || !supabase) return;
  const wasMigrated = localStorage.getItem("colour_seven_products_migrated");
  if (wasMigrated === "1") return;

  const customized = localStorage.getItem(PRODUCTS_CUSTOMIZED_KEY) === "1";
  if (!customized) return;

  const rawLocal = localStorage.getItem(STORAGE_KEY);
  if (!rawLocal) return;

  try {
    const localProducts = JSON.parse(rawLocal) as Product[];
    if (!Array.isArray(localProducts) || localProducts.length === 0) return;

    // Fetch remote products to see what's already there
    const remoteProducts = await fetchRemoteProducts();
    if (remoteProducts === null) {
      console.warn("Could not fetch remote products; skipping migration for now.");
      return;
    }
    const remoteNames = new Set(remoteProducts.map((p) => p.name.toLowerCase().trim()));

    const catalog = await loadCatalog();

    for (const lp of localProducts) {
      if (remoteNames.has(lp.name.toLowerCase().trim())) {
        continue;
      }

      const category = catalog.categories.find(
        (c) => slugToProductCategory(c.slug) === lp.category
      );
      const brand = catalog.brands.find(
        (b) => b.name === lp.brand && b.category_id === category?.slug
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
          const slug = lp.name.toLowerCase().replace(/\s+/g, "-");
          const { data, error } = await supabase
            .from("products")
            .insert({
              category_id: catRow.id,
              brand_id: brandRow.id,
              name: lp.name,
              slug: `${slug}-${Date.now()}`,
              short_description: lp.description.slice(0, 200),
              full_description: lp.description,
              sku: `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              original_price: lp.price,
              discount_price: lp.price,
              featured: lp.isNew,
              tags: lp.isTrending ? ["trending"] : [],
              is_active: true,
            })
            .select("id")
            .single();

          if (!error && data?.id) {
            if (lp.images && lp.images.length > 0) {
              const imageInserts = lp.images.map((imgUrl, index) => ({
                product_id: data.id,
                image_url: imgUrl,
                display_order: index,
                is_main: index === 0,
              }));
              await supabase.from("product_images").insert(imageInserts);
            }

            const variantInserts: any[] = [];
            let variantIndex = 0;
            const sizesToInsert = lp.sizes && lp.sizes.length > 0 ? lp.sizes : ["One Size"];
            const colorsToInsert = lp.colors && lp.colors.length > 0 ? lp.colors : ["Default"];

            for (const s of sizesToInsert) {
              for (const c of colorsToInsert) {
                variantInserts.push({
                  product_id: data.id,
                  size: s,
                  color: c,
                  sku: `SKU-${data.id}-${variantIndex++}-${Math.random().toString(36).slice(2, 5)}`,
                  stock_quantity: 10,
                  stock_status: "in_stock",
                });
              }
            }

            if (variantInserts.length > 0) {
              await supabase.from("product_variants").insert(variantInserts);
            }
          }
        }
      }
    }

    localStorage.setItem("colour_seven_products_migrated", "1");
  } catch (err) {
    console.error("Migration of local products failed:", err);
  }
}

export async function loadProducts(force = false): Promise<Product[]> {
  if (memoryCache && !force) return memoryCache;

  if (isSupabaseConfigured && supabase) {
    try {
      await migrateLocalProductsToSupabase();
      const remote = await fetchRemoteProducts();
      if (remote !== null) {
        memoryCache = remote;
        return remote;
      }
    } catch (error) {
      console.error("Failed to load from Supabase:", error);
    }
  }

  if (memoryCache) return memoryCache;

  const defaults = buildDefaultProducts();
  memoryCache = defaults;
  return defaults;
}

export function getProductsSync(): Product[] {
  return memoryCache || [];
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
    try {
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
              tags: product.isTrending ? ["trending"] : [],
              is_active: true,
            })
            .select("id")
            .single();

          if (error) {
            console.error("Supabase insert product failed:", error);
            throw error;
          }

          if (data?.id) {
            newProduct.id = String(data.id);
            
            if (product.images && product.images.length > 0) {
              const imageInserts = product.images.map((imgUrl, index) => ({
                product_id: data.id,
                image_url: imgUrl,
                display_order: index,
                is_main: index === 0,
              }));
              await supabase.from("product_images").insert(imageInserts);
            }

            const variantInserts: any[] = [];
            let variantIndex = 0;
            const sizesToInsert = product.sizes && product.sizes.length > 0 ? product.sizes : ["One Size"];
            const colorsToInsert = product.colors && product.colors.length > 0 ? product.colors : ["Default"];

            for (const s of sizesToInsert) {
              for (const c of colorsToInsert) {
                variantInserts.push({
                  product_id: data.id,
                  size: s,
                  color: c,
                  sku: `SKU-${data.id}-${variantIndex++}-${Math.random().toString(36).slice(2, 5)}`,
                  stock_quantity: 10,
                  stock_status: "in_stock",
                });
              }
            }

            if (variantInserts.length > 0) {
              await supabase.from("product_variants").insert(variantInserts);
            }

            const remote = await fetchRemoteProducts();
            if (remote) {
              memoryCache = remote;
              const updatedProduct = remote.find((p) => p.id === newProduct.id);
              if (updatedProduct) {
                return updatedProduct;
              }
            }
            return newProduct;
          }
        }
      }
    } catch (error) {
      console.error("Failed to save to Supabase:", error);
      throw error;
    }
  }

  const list = memoryCache || buildDefaultProducts();
  const updatedList = [...list, newProduct];
  memoryCache = updatedList;
  return newProduct;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<void> {
  if (supabase) {
    try {
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
      if (updates.isTrending !== undefined) {
        payload.tags = updates.isTrending ? ["trending"] : [];
      }

      if (Object.keys(payload).length > 0) {
        const { error } = await supabase.from("products").update(payload).eq("id", id);
        if (error) {
          console.error("Supabase update failed:", error.message);
          throw error;
        }
      }

      if (updates.images !== undefined) {
        await supabase.from("product_images").delete().eq("product_id", id);
        if (updates.images.length > 0) {
          const imageInserts = updates.images.map((imgUrl, index) => ({
            product_id: id,
            image_url: imgUrl,
            display_order: index,
            is_main: index === 0,
          }));
          await supabase.from("product_images").insert(imageInserts);
        }
      }

      if (updates.sizes !== undefined || updates.colors !== undefined) {
        const existing = (memoryCache || []).find((p) => p.id === id);
        const sizesToInsert = updates.sizes !== undefined ? updates.sizes : (existing?.sizes || ["One Size"]);
        const colorsToInsert = updates.colors !== undefined ? updates.colors : (existing?.colors || ["Default"]);

        await supabase.from("product_variants").delete().eq("product_id", id);

        const variantInserts: any[] = [];
        let variantIndex = 0;
        const finalSizes = sizesToInsert.length > 0 ? sizesToInsert : ["One Size"];
        const finalColors = colorsToInsert.length > 0 ? colorsToInsert : ["Default"];

        for (const s of finalSizes) {
          for (const c of finalColors) {
            variantInserts.push({
              product_id: id,
              size: s,
              color: c,
              sku: `SKU-${id}-${variantIndex++}-${Math.random().toString(36).slice(2, 5)}`,
              stock_quantity: 10,
              stock_status: "in_stock",
            });
          }
        }
        if (variantInserts.length > 0) {
          await supabase.from("product_variants").insert(variantInserts);
        }
      }

      const remote = await fetchRemoteProducts();
      if (remote) {
        memoryCache = remote;
        return;
      }
    } catch (error) {
      console.error("Failed to update in Supabase:", error);
      throw error;
    }
  }

  const list = memoryCache || buildDefaultProducts();
  memoryCache = list.map((p) => (p.id === id ? { ...p, ...updates } : p));
}

export async function deleteProduct(id: string): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        console.error("Supabase delete failed:", error.message);
        throw error;
      }
      const remote = await fetchRemoteProducts();
      if (remote) {
        memoryCache = remote;
        return;
      }
    } catch (error) {
      console.error("Failed to delete from Supabase:", error);
      throw error;
    }
  }

  const list = memoryCache || buildDefaultProducts();
  memoryCache = list.filter((p) => p.id !== id);
}


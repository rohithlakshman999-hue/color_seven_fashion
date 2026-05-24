import { products as defaultProducts } from "@/data/products";
import type { Product } from "@/context/ProductContext";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { slugToProductCategory } from "@/lib/catalogHelpers";
import { loadCatalog } from "@/lib/catalogStore";

let memoryCache: Product[] | null = null;

function buildDefaultProducts(): Product[] {
  return defaultProducts.map((p) => ({
    ...p,
    brand: p.brand || "Colour Seven",
    stock: p.stock ?? 10,
  })).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));
}

async function fetchRemoteProducts(): Promise<Product[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        slug,
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
        product_variants ( size, color, stock_quantity )
      `
      );

    if (error) {
      console.error("Supabase products fetch failed:", error);
      return null;
    }

    if (!data?.length) return [];

    const mapped = data.map((row) => {
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

      const rawVariants = r.product_variants as { size?: string; color?: string; stock_quantity?: number }[] | null;
      const sizesSet = new Set<string>();
      const colorsSet = new Set<string>();
      let totalStock = 0;
      if (rawVariants && Array.isArray(rawVariants)) {
        rawVariants.forEach((v) => {
          if (v.size) sizesSet.add(v.size);
          if (v.color) colorsSet.add(v.color);
          if (v.stock_quantity) totalStock += Number(v.stock_quantity);
        });
      }
      const sizes = sizesSet.size > 0 ? Array.from(sizesSet) : ["One Size"];
      const colors = colorsSet.size > 0 ? Array.from(colorsSet) : ["Default"];

      const rawTags = r.tags as string[] | null;
      const isTrending = Array.isArray(rawTags) && rawTags.includes("trending");

      const discountPrice = Number(r.discount_price);
      const originalPrice = Number(r.original_price);
      const finalPrice = Number.isFinite(discountPrice) && discountPrice > 0 
        ? discountPrice 
        : (Number.isFinite(originalPrice) && originalPrice > 0 ? originalPrice : 0);

      return {
        id: String(r.id),
        slug: String(r.slug),
        name: String(r.name),
        brand: brandObj?.name || "Colour Seven",
        price: finalPrice,
        category: slugToProductCategory(slug),
        images,
        description: String(r.full_description || r.short_description || ""),
        sizes,
        colors,
        stock: totalStock,
        isNew: Boolean(r.featured),
        isTrending,
      };
    });

    return mapped.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));
  } catch (error: any) {
    console.error("Supabase error:", {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      fullError: JSON.stringify(error, null, 2)
    });
    return null;
  }
}

async function migrateLocalProductsToSupabase() {
  // Migration disabled - no localStorage persistence
  return;
}

export async function loadProducts(force = false): Promise<Product[]> {
  if (memoryCache && !force) return memoryCache;

  if (!isSupabaseConfigured || !supabase) {
    // Return in-memory defaults only for display if Supabase unavailable
    const defaults = buildDefaultProducts();
    memoryCache = defaults;
    return defaults;
  }

  try {
    await migrateLocalProductsToSupabase();
    const remote = await fetchRemoteProducts();
    if (remote !== null && remote.length > 0) {
      memoryCache = remote;
      return remote;
    }
  } catch (error) {
    
  }

  // Return in-memory defaults if Supabase fetch fails
  const defaults = buildDefaultProducts();
  memoryCache = defaults;
  return defaults;
}

export function getProductsSync(): Product[] {
  return memoryCache || buildDefaultProducts();
}

export function invalidateProductsCache() {
  memoryCache = null;
}

export async function refreshProducts(): Promise<Product[]> {
  invalidateProductsCache();
  return loadProducts(true);
}

const isUuid = (str?: string) => str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str) : false;

async function resolveCategoryAndBrandIds(targetCategory: string, targetBrand: string): Promise<{ category_id: string, brand_id: string }> {
  const catalog = await loadCatalog();
  
  // 1. Resolve Category
  const catSlugBase = targetCategory.toLowerCase().replace(/\s+/g, '-');
  let category = catalog.categories.find(
    (c) => 
      c.id === targetCategory || 
      c.slug === catSlugBase ||
      slugToProductCategory(c.slug) === targetCategory ||
      c.name.toLowerCase() === targetCategory.toLowerCase()
  );

  let catId = category?.id;

  if (!catId && supabase) {
    let query = supabase.from('categories').select('id').or(`slug.eq.${catSlugBase},name.ilike.${targetCategory}`);
    if (isUuid(targetCategory)) {
      query = supabase.from('categories').select('id').or(`id.eq.${targetCategory},slug.eq.${catSlugBase},name.ilike.${targetCategory}`);
    }
    const { data } = await query.limit(1);
    if (data && data.length > 0) catId = data[0].id;
  }

  // If we have an ID but it's not a UUID (e.g. legacy 'watches' string) OR if we still have no ID
  if (!isUuid(catId) && supabase) {
    const slugToQuery = category?.slug || catSlugBase;
    
    // Attempt to lookup
    const { data: fetchCat } = await supabase.from('categories').select('id').eq('slug', slugToQuery).limit(1);
    
    if (fetchCat && fetchCat.length > 0) {
      catId = fetchCat[0].id;
    } else {
      // Not in DB, must create!
      const { data: insertCat } = await supabase.from('categories').insert({
        name: targetCategory,
        slug: slugToQuery + '-' + Math.random().toString(36).slice(2, 6),
        description: `Category for ${targetCategory}`
      }).select('id');
      if (insertCat && insertCat.length > 0) catId = insertCat[0].id;
    }
  }

  // Fallback to first valid UUID category
  if (!isUuid(catId)) {
    const validCat = catalog.categories.find(c => isUuid(c.id));
    if (validCat) catId = validCat.id;
  }

  if (!isUuid(catId)) throw new Error("No categories exist to map to.");

  // 2. Resolve Brand
  const brandSlugBase = targetBrand.toLowerCase().replace(/\s+/g, '-');
  let brand = catalog.brands.find(
    (b) => 
      b.id === targetBrand || 
      b.slug === brandSlugBase ||
      b.name.toLowerCase() === targetBrand.toLowerCase()
  );

  let brandId = brand?.id;

  if (!brandId && supabase) {
    let query = supabase.from('brands').select('id').or(`slug.eq.${brandSlugBase},name.ilike.${targetBrand}`);
    if (isUuid(targetBrand)) {
      query = supabase.from('brands').select('id').or(`id.eq.${targetBrand},slug.eq.${brandSlugBase},name.ilike.${targetBrand}`);
    }
    const { data } = await query.limit(1);
    if (data && data.length > 0) brandId = data[0].id;
  }

  if (!isUuid(brandId) && supabase) {
    const slugToQuery = brand?.slug || brandSlugBase;
    
    const { data: fetchBrand } = await supabase.from('brands').select('id').eq('slug', slugToQuery).limit(1);
    
    if (fetchBrand && fetchBrand.length > 0) {
      brandId = fetchBrand[0].id;
    } else {
      const { data: insertBrand } = await supabase.from('brands').insert({
        name: targetBrand,
        slug: slugToQuery + '-' + Math.random().toString(36).slice(2, 6),
        category_id: catId,
        description: `Brand ${targetBrand}`
      }).select('id');
      if (insertBrand && insertBrand.length > 0) brandId = insertBrand[0].id;
    }
  }

  if (!isUuid(brandId)) {
    const validBrand = catalog.brands.find(b => isUuid(b.id));
    if (validBrand) brandId = validBrand.id;
  }

  if (!isUuid(brandId)) throw new Error("No brands exist to map to.");

  return { category_id: catId as string, brand_id: brandId as string };
}

export async function ensureRemoteProduct(product: Product | undefined, currentId: string): Promise<string> {
  if (!supabase) throw new Error("Supabase is not configured");

  if (isUuid(currentId)) {
    const { data } = await supabase.from("products").select("id").eq("id", currentId).maybeSingle();
    if (data?.id) return data.id; // Exists remotely!
  }

  // Not a UUID or not found remotely -> Sync it
  if (!product) {
    throw new Error("Local product not found to sync");
  }

  // We add it to Supabase
  const remoteProduct = await addProduct(product);
  return remoteProduct.id;
}

export async function addProduct(product: Omit<Product, "id">): Promise<Product> {
  const price = Number(product.price);
  const validatedPrice = Number.isFinite(price) && price >= 0 ? price : 0;
  
  const newProduct: Product = {
    ...product,
    price: validatedPrice,
    id: `${Date.now()}${Math.random().toString(36).slice(2, 9)}`,
  };

  if (supabase) {
    try {
      const { category_id, brand_id } = await resolveCategoryAndBrandIds(product.category, product.brand);
      
      if (!isUuid(category_id)) throw new Error("Invalid category UUID");
      if (!isUuid(brand_id)) throw new Error("Invalid brand UUID");

      const slug = product.name.toLowerCase().replace(/\s+/g, "-");
      
      const { data, error } = await supabase
        .from("products")
        .insert({
          category_id,
          brand_id,
          name: product.name,
          slug: `${slug}-${Date.now()}`,
          short_description: product.description.slice(0, 200),
          full_description: product.description,
          sku: `SKU-${Date.now()}`,
          original_price: validatedPrice,
          discount_price: validatedPrice,
          featured: product.isNew,
          tags: product.isTrending ? ["trending"] : [],
          is_active: true,
        })
        .select("id")
        .single();

      if (error || !data?.id) {
        throw error || new Error("Failed to create product in Supabase");
      }

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
            stock_quantity: product.stock ?? 10,
            stock_status: (product.stock ?? 10) > 0 ? "in_stock" : "out_of_stock",
          });
        }
      }

      if (variantInserts.length > 0) {
        await supabase.from("product_variants").insert(variantInserts);
      }

      // Force cache refresh after add
      invalidateProductsCache();
      const remote = await fetchRemoteProducts();
      if (remote) {
        memoryCache = remote;
        const updatedProduct = remote.find((p) => p.id === newProduct.id);
        if (updatedProduct) return updatedProduct;
      }
      return newProduct;
    } catch (error: any) {
      
      throw new Error(error?.message || JSON.stringify(error) || "Unknown error");
    }
  } else {
    throw new Error("Supabase is required for admin edits");
  }
}

export async function updateProduct(
  id: string,
  product: Partial<Product>
): Promise<void> {
  console.log("Updating product:", product);
  console.log("Product ID:", id);

  if (!id) {
    throw new Error("Product ID is required for update");
  }

  if (supabase) {
    try {
      const existingProduct = (memoryCache || []).find((p) => p.id === id);
      const validRemoteProductId = await ensureRemoteProduct(existingProduct, id);

      if (!isUuid(validRemoteProductId)) {
        throw new Error("Invalid remote product UUID");
      }

      const payload: Record<string, unknown> = {};
      
      // 1. Verify and map core fields
      if (product.name !== undefined) payload.name = product.name;
      
      if (product.price !== undefined) {
        const price = Number(product.price);
        if (!Number.isFinite(price) || price < 0) {
          throw new Error("Invalid price value");
        }
        payload.discount_price = price;
        payload.original_price = price;
      }

      if (product.description !== undefined) {
        payload.full_description = product.description;
        payload.short_description = product.description.slice(0, 200);
      }

      if (product.isNew !== undefined) payload.featured = product.isNew;
      
      if (product.isTrending !== undefined) {
        payload.tags = product.isTrending ? ["trending"] : [];
      }

      // 2. Handle category and brand UUIDs
      if (product.category !== undefined || product.brand !== undefined) {
        const targetCategoryName = product.category || existingProduct?.category;
        const targetBrandName = product.brand || existingProduct?.brand;

        if (!targetCategoryName || !targetBrandName) {
           throw new Error("Missing category or brand context for update");
        }

        const { category_id, brand_id } = await resolveCategoryAndBrandIds(targetCategoryName, targetBrandName);
        
        if (!isUuid(category_id)) throw new Error("Invalid category UUID");
        if (!isUuid(brand_id)) throw new Error("Invalid brand UUID");

        payload.category_id = category_id;
        payload.brand_id = brand_id;
      }

      payload.updated_at = new Date().toISOString();

      // 3. Update Product Table
      if (Object.keys(payload).length > 0) {
        const { error } = await supabase.from("products").update(payload).eq("id", validRemoteProductId);
        if (error)
    throw new Error(error?.message || JSON.stringify(error) || "Unknown error");
      }

      // 4. Update Images Table
      if (product.images !== undefined) {
        const { error: deleteImgErr } = await supabase.from("product_images").delete().eq("product_id", validRemoteProductId);
        if (deleteImgErr) throw deleteImgErr;

        if (product.images.length > 0) {
          const imageInserts = product.images.map((imgUrl, index) => ({
            product_id: validRemoteProductId,
            image_url: imgUrl,
            display_order: index,
            is_main: index === 0,
          }));
          const { error: insertImgErr } = await supabase.from("product_images").insert(imageInserts);
          if (insertImgErr) throw insertImgErr;
        }
      }

      // 5. Update Variants Table
      if (product.sizes !== undefined || product.colors !== undefined) {
        const existing = (memoryCache || []).find((p) => p.id === id) || existingProduct;
        const sizesToInsert = product.sizes !== undefined ? product.sizes : (existing?.sizes || ["One Size"]);
        const colorsToInsert = product.colors !== undefined ? product.colors : (existing?.colors || ["Default"]);

        const { error: deleteVarErr } = await supabase.from("product_variants").delete().eq("product_id", validRemoteProductId);
        if (deleteVarErr) throw deleteVarErr;

        const variantInserts: any[] = [];
        let variantIndex = 0;
        const finalSizes = sizesToInsert.length > 0 ? sizesToInsert : ["One Size"];
        const finalColors = colorsToInsert.length > 0 ? colorsToInsert : ["Default"];

        for (const s of finalSizes) {
          for (const c of finalColors) {
            variantInserts.push({
              product_id: validRemoteProductId,
              size: s,
              color: c,
              sku: `SKU-${validRemoteProductId}-${variantIndex++}-${Math.random().toString(36).slice(2, 5)}`,
              stock_quantity: 10,
              stock_status: "in_stock",
            });
          }
        }
        if (variantInserts.length > 0) {
          const { error: insertVarErr } = await supabase.from("product_variants").insert(variantInserts);
          if (insertVarErr) throw insertVarErr;
        }
      }

      // Force cache refresh after update
      invalidateProductsCache();
      const remote = await fetchRemoteProducts();
      if (remote) {
        memoryCache = remote;
      }
    } catch (error: any) {
    console.error("Supabase error:", {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      fullError: JSON.stringify(error, null, 2)
    });
    throw new Error(error?.message || JSON.stringify(error) || "Unknown error");
    }
  } else {
    throw new Error("Supabase is required for admin edits");
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (supabase) {
    try {
      if (isUuid(id)) {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error)
    throw new Error(error?.message || JSON.stringify(error) || "Unknown error");
      }
      
      // Force cache refresh after delete
      invalidateProductsCache();
      const remote = await fetchRemoteProducts();
      if (remote && remote.length > 0) {
        memoryCache = remote;
      } else {
        // Handle deletion of local legacy products to avoid immediate respawning
        const list = memoryCache || buildDefaultProducts();
        memoryCache = list.filter((p) => p.id !== id);
      }
    } catch (error: any) {
      console.error("Supabase error:", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        fullError: JSON.stringify(error, null, 2),
      });
      throw new Error(error?.message || JSON.stringify(error) || "Unknown error");
    }
  } else {
    throw new Error("Supabase is required for admin edits");
  }
}

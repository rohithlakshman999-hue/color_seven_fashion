"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

function validateSupabaseConnection() {
  if (!supabaseAdmin) {
    throw new Error("Supabase Admin not configured. Please check your environment variables.");
  }
}

export async function adminAddCategory(payload: any) {
  validateSupabaseConnection();
  const client = supabaseAdmin!;
  
  // Validate required fields
  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length === 0) {
    throw new Error("Category name is required and must be a non-empty string");
  }
  if (!payload.slug || typeof payload.slug !== 'string' || payload.slug.trim().length === 0) {
    throw new Error("Category slug is required and must be a non-empty string");
  }
  
  const { error } = await client.from("categories").insert(payload);
  if (error) throw new Error(`Failed to add category: ${error.message}`);
  return { success: true };
}

export async function adminUpdateCategory(slug: string, payload: any) {
  validateSupabaseConnection();
  const client = supabaseAdmin!;
  const { error } = await client.from("categories").update(payload).eq("slug", slug);
  if (error) throw new Error(`Failed to update category: ${error.message}`);
  return { success: true };
}

export async function adminDeleteCategory(slug: string) {
  validateSupabaseConnection();
  const client = supabaseAdmin!;
  const { error } = await client.from("categories").delete().eq("slug", slug);
  if (error) throw new Error(`Failed to delete category: ${error.message}`);
  return { success: true };
}

export async function adminAddBrand(payload: any) {
  validateSupabaseConnection();
  const client = supabaseAdmin!;
  
  // Validate required fields
  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length === 0) {
    throw new Error("Brand name is required and must be a non-empty string");
  }
  if (!payload.category_id || typeof payload.category_id !== 'string') {
    throw new Error("Brand category_id is required and must be a string");
  }
  
  const { error } = await client.from("brands").insert(payload);
  if (error) throw new Error(`Failed to add brand: ${error.message}`);
  return { success: true };
}

export async function adminUpdateBrand(slug: string, categoryId: string, payload: any) {
  validateSupabaseConnection();
  const client = supabaseAdmin!;
  const { error } = await client.from("brands").update(payload).eq("slug", slug).eq("category_id", categoryId);
  if (error) throw new Error(`Failed to update brand: ${error.message}`);
  return { success: true };
}

export async function adminDeleteBrand(slug: string, categoryId: string) {
  validateSupabaseConnection();
  const client = supabaseAdmin!;
  const { error } = await client.from("brands").delete().eq("slug", slug).eq("category_id", categoryId);
  if (error) throw new Error(`Failed to delete brand: ${error.message}`);
  return { success: true };
}

export async function adminAddProduct(payload: any) {
  validateSupabaseConnection();
  const client = supabaseAdmin!;
  
  // Validate required fields
  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length === 0) {
    throw new Error("Product name is required and must be a non-empty string");
  }
  if (!payload.category_id || typeof payload.category_id !== 'string') {
    throw new Error("Product category_id is required and must be a string");
  }
  if (!payload.brand_id || typeof payload.brand_id !== 'string') {
    throw new Error("Product brand_id is required and must be a string");
  }
  
  const { data, error } = await client.from("products").insert(payload).select("id").single();
  if (error) throw new Error(`Failed to add product: ${error.message}`);
  return { success: true, id: data.id };
}

export async function adminUpdateProduct(id: string, payload: any) {
  validateSupabaseConnection();
  const client = supabaseAdmin!;
  
  // Validate price if provided
  if (payload.discount_price !== undefined) {
    const price = Number(payload.discount_price);
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Discount price must be a valid non-negative number");
    }
  }
  if (payload.original_price !== undefined) {
    const price = Number(payload.original_price);
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Original price must be a valid non-negative number");
    }
  }
  
  const { error } = await client.from("products").update(payload).eq("id", id);
  if (error) throw new Error(`Failed to update product: ${error.message}`);
  return { success: true };
}

export async function adminDeleteProduct(id: string) {
  validateSupabaseConnection();
  const client = supabaseAdmin!;
  const { error } = await client.from("products").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete product: ${error.message}`);
  return { success: true };
}

export async function adminUpsertProductImages(images: any[], productId: string) {
  validateSupabaseConnection();
  const client = supabaseAdmin!;
  // Delete existing first
  await client.from("product_images").delete().eq("product_id", productId);
  if (images.length > 0) {
    const { error } = await client.from("product_images").insert(images);
    if (error) throw new Error(`Failed to upsert product images: ${error.message}`);
  }
  return { success: true };
}

export async function adminUpsertProductVariants(variants: any[], productId: string) {
  validateSupabaseConnection();
  const client = supabaseAdmin!;
  // Delete existing first
  await client.from("product_variants").delete().eq("product_id", productId);
  if (variants.length > 0) {
    const { error } = await client.from("product_variants").insert(variants);
    if (error) throw new Error(`Failed to upsert product variants: ${error.message}`);
  }
  return { success: true };
}

export async function adminMigrateData(payload: { categories: any[]; brands: any[]; products: any[] }) {
  if (!supabaseAdmin) return { success: false, error: "Supabase Admin not configured" };

  try {
    // 1. Categories
    for (const c of payload.categories) {
      const { data } = await supabaseAdmin.from("categories").select("slug").eq("slug", c.slug).maybeSingle();
      if (!data) {
        await supabaseAdmin.from("categories").insert(c);
      }
    }

    // Refresh UUIDs
    const { data: catRows } = await supabaseAdmin.from("categories").select("id, slug");
    const categorySlugToUuid = new Map<string, string>();
    catRows?.forEach(r => categorySlugToUuid.set(r.slug, r.id));

    // 2. Brands
    for (const b of payload.brands) {
      const categoryId = categorySlugToUuid.get(b.category_id);
      if (categoryId) {
        const { data } = await supabaseAdmin.from("brands").select("slug").eq("slug", b.slug).eq("category_id", categoryId).maybeSingle();
        if (!data) {
          const newBrand = { ...b, category_id: categoryId };
          await supabaseAdmin.from("brands").insert(newBrand);
        }
      }
    }

    // Refresh Brands UUIDs
    const { data: brandRows } = await supabaseAdmin.from("brands").select("id, name, category_id");

    // 3. Products
    for (const p of payload.products) {
      const catUuid = categorySlugToUuid.get(p.category_slug);
      const brandRow = brandRows?.find(r => r.name === p.brand_name && r.category_id === catUuid);
      
      if (catUuid && brandRow) {
        const { data } = await supabaseAdmin.from("products").select("slug").eq("name", p.name).maybeSingle();
        if (!data) {
          const productPayload = {
            ...p.product_data,
            category_id: catUuid,
            brand_id: brandRow.id,
          };
          const { data: insertedProduct } = await supabaseAdmin.from("products").insert(productPayload).select("id").single();
          
          if (insertedProduct) {
            if (p.images && p.images.length > 0) {
              const imageInserts = p.images.map((imgUrl: string, idx: number) => ({
                product_id: insertedProduct.id,
                image_url: imgUrl,
                display_order: idx,
                is_main: idx === 0
              }));
              await supabaseAdmin.from("product_images").insert(imageInserts);
            }
            if (p.variants && p.variants.length > 0) {
              const variantInserts = p.variants.map((v: any) => ({
                ...v,
                product_id: insertedProduct.id,
                sku: `SKU-${insertedProduct.id}-${Math.random().toString(36).slice(2, 6)}`
              }));
              await supabaseAdmin.from("product_variants").insert(variantInserts);
            }
          }
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

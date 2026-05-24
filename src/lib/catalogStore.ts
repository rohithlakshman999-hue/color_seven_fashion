import { allBrands, categories as defaultCategories } from "@/data/brands";
import { Brand, Category } from "@/types/database";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type CatalogData = { categories: Category[]; brands: Brand[] };

let memoryCache: CatalogData | null = null;

export function slugifyName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function buildBrandId(categoryId: string, name: string): string {
  return `${categoryId}-${slugifyName(name)}`;
}

export function brandOptionKey(brand: { category_id: string; id: string }): string {
  return `${brand.category_id}::${brand.id}`;
}

function buildDefaultCatalog(): CatalogData {
  const categories: Category[] = defaultCategories.map((c, index) => ({
    id: c.slug,
    slug: c.slug,
    name: c.name,
    description: c.description || "",
    image: "",
    icon: "",
    display_order: index,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const brands: Brand[] = allBrands.map((b, index) => {
    const categoryId = b.category.toLowerCase();
    return {
      id: buildBrandId(categoryId, b.name),
      category_id: categoryId,
      name: b.name,
      slug: slugifyName(b.name),
      logo: "",
      banner: "",
      description: b.description || `Premium products from ${b.name}`,
      display_order: index,
      is_active: true,
      featured: b.featured || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const sortedBrands = brands.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));

  return { categories, brands: sortedBrands };
}

function normalizeBrands(brands: Brand[]): Brand[] {
  const seen = new Set<string>();
  return brands.map((b) => {
    let id = buildBrandId(b.category_id, b.name);
    if (seen.has(id)) {
      let suffix = 2;
      while (seen.has(`${id}-${suffix}`)) suffix += 1;
      id = `${id}-${suffix}`;
    }
    seen.add(id);
    return { ...b, id, slug: slugifyName(b.name) };
  });
}

function mapRemoteCategory(row: Record<string, unknown>): Category {
  const slug = String(row.slug);
  return {
    id: slug,
    slug,
    name: String(row.name),
    description: String(row.description || ""),
    image: String(row.image || ""),
    icon: String(row.icon || ""),
    display_order: Number(row.display_order) || 0,
    is_active: row.is_active !== false,
    created_at: String(row.created_at || new Date().toISOString()),
    updated_at: String(row.updated_at || new Date().toISOString()),
  };
}

async function fetchRemoteCatalog(): Promise<CatalogData | null> {
  if (!supabase) return null;

  try {
    const { data: catRows, error: catError } = await supabase
      .from("categories")
      .select("*")
      .order("display_order");

    if (catError) throw catError;

    const { data: brandRows, error: brandError } = await supabase
      .from("brands")
      .select("*")
      .order("display_order");

    if (brandError) throw brandError;

    const uuidToSlug = new Map<string, string>();
    const categories = (catRows || []).map((row) => {
      const cat = mapRemoteCategory(row as Record<string, unknown>);
      uuidToSlug.set(String(row.id), cat.slug);
      return cat;
    });

    const brands: Brand[] = (brandRows || []).map((row) => {
      const r = row as Record<string, unknown>;
      const categorySlug = uuidToSlug.get(String(r.category_id)) || String(r.category_id);
      const name = String(r.name);
      return {
        id: buildBrandId(categorySlug, name),
        category_id: categorySlug,
        name,
        slug: String(r.slug || slugifyName(name)),
        logo: String(r.logo || ""),
        banner: String(r.banner || ""),
        description: String(r.description || ""),
        website: r.website ? String(r.website) : undefined,
        display_order: Number(r.display_order) || 0,
        is_active: r.is_active !== false,
        featured: Boolean(r.featured),
        created_at: String(r.created_at || new Date().toISOString()),
        updated_at: String(r.updated_at || new Date().toISOString()),
      };
    });

    const filteredBrands = normalizeBrands(brands)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }));

    return { categories, brands: filteredBrands };
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

  async function seedDefaultCatalogIfEmpty(): Promise<void> {
    if (!supabase) return;

    const defaultCatalog = buildDefaultCatalog();

    const { data: existingCategories, error: categoryError } = await supabase
      .from("categories")
      .select("id, slug");
    if (categoryError) {
      
      return;
    }

    const existingCategorySlugs = new Set<string>(
      (existingCategories || []).map((row) => String(row.slug))
    );

    const categoriesToInsert = defaultCatalog.categories
      .filter((category) => !existingCategorySlugs.has(category.slug))
      .map((category) => ({
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image || null,
        icon: category.icon || null,
        display_order: category.display_order,
        is_active: category.is_active,
      }));

    if (categoriesToInsert.length > 0) {
      const { error } = await supabase.from("categories").insert(categoriesToInsert);
      if (error) {
        
        return;
      }
    }

    const { data: categoryRows, error: categoryRowsError } = await supabase
      .from("categories")
      .select("id, slug");
    if (categoryRowsError) {
      
      return;
    }

    const categorySlugToUuid = new Map<string, string>();
    (categoryRows || []).forEach((row) => {
      categorySlugToUuid.set(String(row.slug), String(row.id));
    });

    const { data: existingBrands, error: brandError } = await supabase
      .from("brands")
      .select("slug, category_id");
    if (brandError) {
      
      return;
    }

    const existingBrandKeys = new Set<string>(
      (existingBrands || []).map((row) => `${String(row.category_id)}::${String(row.slug)}`)
    );

    const brandsToInsert = defaultCatalog.brands
      .map((brand) => {
        const categoryUuid = categorySlugToUuid.get(brand.category_id);
        if (!categoryUuid) return null;
        return {
          category_id: categoryUuid,
          name: brand.name,
          slug: brand.slug,
          logo: brand.logo || null,
          banner: brand.banner || null,
          description: brand.description,
          website: brand.website || null,
          display_order: brand.display_order,
          is_active: brand.is_active,
          featured: brand.featured,
        };
      })
      .filter((item): item is { category_id: string; name: string; slug: string; logo: string | null; banner: string | null; description: string; website: string | null; display_order: number; is_active: boolean; featured: boolean } => item !== null)
      .filter((brand) => !existingBrandKeys.has(`${brand.category_id}::${brand.slug}`));

    if (brandsToInsert.length > 0) {
      const { error } = await supabase.from("brands").insert(brandsToInsert);
      if (error) {
        
      }
    }
  }

let loadPromise: Promise<CatalogData> | null = null;

export async function loadCatalog(force = false): Promise<CatalogData> {
  // Return from memory cache if available and not forced
  if (memoryCache && !force) return memoryCache;

  if (!force && loadPromise) return loadPromise;

  loadPromise = (async () => {
    // If Supabase is configured, load from remote
    if (isSupabaseConfigured && supabase) {
      try {
        const remoteCatalog = await fetchRemoteCatalog();
        if (remoteCatalog && remoteCatalog.categories.length === 0 && remoteCatalog.brands.length === 0) {
          await seedDefaultCatalogIfEmpty();
          const seededCatalog = await fetchRemoteCatalog();
          if (seededCatalog !== null) {
            memoryCache = seededCatalog;
            return seededCatalog;
          }
        }
        if (remoteCatalog !== null) {
          memoryCache = remoteCatalog;
          return remoteCatalog;
        }
      } catch (error) {
        
      }
    }

    // Fallback to defaults only if Supabase fails
    const defaults = buildDefaultCatalog();
    memoryCache = defaults;
    return defaults;
  })();

  try {
    const result = await loadPromise;
    return result;
  } finally {
    loadPromise = null;
  }
}

export function getCatalogSync(): CatalogData {
  return memoryCache || buildDefaultCatalog();
}

export function invalidateCatalogCache() {
  memoryCache = null;
}

export async function refreshCatalog(): Promise<CatalogData> {
  invalidateCatalogCache();
  return loadCatalog(true);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getCatalogSync().categories.find((c) => c.slug === slug);
}

export function getBrandsForCategorySlug(slug: string): Brand[] {
  return getCatalogSync().brands.filter(
    (b) => b.category_id === slug && b.is_active !== false
  );
}

export function getBrandBySlug(
  categorySlug: string,
  brandSlug: string
): Brand | undefined {
  return getCatalogSync().brands.find(
    (b) => b.slug === brandSlug && b.category_id === categorySlug
  );
}

export function getBrandById(id: string): Brand | undefined {
  return getCatalogSync().brands.find((b) => b.id === id);
}

async function resolveCategoryUuid(slugOrId: string): Promise<string | null> {
  if (!supabase) return null;
  
  // First check if it's already a UUID (match exact id)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  if (isUuid) return slugOrId;

  const { data } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slugOrId)
    .maybeSingle();
  return data?.id ? String(data.id) : null;
}

export async function addCategory(
  data: Omit<Category, "id" | "created_at" | "updated_at">
): Promise<Category> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
  }

  const now = new Date().toISOString();
  const category: Category = {
    ...data,
    id: data.slug,
    created_at: now,
    updated_at: now,
  };

  try {
    const { error, data: insertedData } = await supabase.from("categories").insert({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      icon: category.icon || null,
      display_order: category.display_order,
      is_active: category.is_active,
    }).select();

    if (error) {
      
      throw new Error(`Failed to add category: ${error.message || error.details || 'Unknown error'}`);
    }

    // Refresh cache after successful insert
    invalidateCatalogCache();
    const refreshed = await loadCatalog(true);
    return refreshed.categories.find((c) => c.slug === category.slug) || category;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    
    throw new Error(`Failed to add category: ${errorMessage}`);
  }
}

export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const now = new Date().toISOString();

  try {
    const payload: Record<string, unknown> = { updated_at: now };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.image !== undefined) payload.image = updates.image;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.display_order !== undefined) payload.display_order = updates.display_order;
    if (updates.is_active !== undefined) payload.is_active = updates.is_active;

    const { error } = await supabase.from("categories").update(payload).eq("slug", id);
    if (error)
    throw new Error(error?.message || JSON.stringify(error) || "Unknown error");

    // Refresh cache after successful update
    invalidateCatalogCache();
    await loadCatalog(true);
  } catch (err: any) {
    console.error("Supabase error:", {
      message: err?.message,
      details: err?.details,
      hint: err?.hint,
      code: err?.code,
      fullError: JSON.stringify(err, null, 2)
    });
    
    throw new Error(err?.message || JSON.stringify(err) || "Unknown error");
  }
}

export async function deleteCategory(id: string): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  try {
    const { error } = await supabase.from("categories").delete().eq("slug", id);
    if (error) throw error;

    // Refresh cache after successful delete
    invalidateCatalogCache();
    await loadCatalog(true);
  } catch (err: any) {
    console.error("Supabase error:", {
      message: err?.message,
      details: err?.details,
      hint: err?.hint,
      code: err?.code,
      fullError: JSON.stringify(err, null, 2)
    });
    
    throw new Error(err?.message || JSON.stringify(err) || "Unknown error");
  }
}

export async function addBrand(
  data: Omit<Brand, "id" | "created_at" | "updated_at"> & {
    name: string;
    category_id: string;
  }
): Promise<Brand> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const now = new Date().toISOString();
  const brand: Brand = {
    id: buildBrandId(data.category_id, data.name),
    category_id: data.category_id,
    name: data.name,
    slug: data.slug || slugifyName(data.name),
    logo: data.logo || "",
    banner: data.banner || "",
    description: data.description || "",
    website: data.website,
    display_order: data.display_order ?? 0,
    is_active: data.is_active ?? true,
    featured: data.featured ?? false,
    created_at: now,
    updated_at: now,
  };

  try {
    const categoryUuid = await resolveCategoryUuid(data.category_id);
    if (!categoryUuid) {
      throw new Error(`Category "${data.category_id}" not found in database`);
    }

    const { error } = await supabase.from("brands").insert({
      category_id: categoryUuid,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || null,
      banner: brand.banner || null,
      description: brand.description,
      website: brand.website || null,
      display_order: brand.display_order,
      is_active: brand.is_active,
      featured: brand.featured,
    });

    if (error) throw error;

    // Refresh cache after successful insert
    invalidateCatalogCache();
    const refreshed = await loadCatalog(true);
    return refreshed.brands.find((b) => b.id === brand.id) || brand;
  } catch (err: any) {
    console.error("Supabase error:", err);
    throw new Error(err?.message || "Unknown error");
  }
}

export async function updateBrand(
  id: string,
  updates: Partial<Brand>
): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const now = new Date().toISOString();

  try {
    const catalog = getCatalogSync();
    const brand = catalog.brands.find((b) => b.id === id);
    if (!brand) {
      throw new Error("Brand not found locally");
    }

    const payload: Record<string, unknown> = { updated_at: now };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.logo !== undefined) payload.logo = updates.logo;
    if (updates.banner !== undefined) payload.banner = updates.banner;
    if (updates.website !== undefined) payload.website = updates.website;
    if (updates.display_order !== undefined) payload.display_order = updates.display_order;
    if (updates.is_active !== undefined) payload.is_active = updates.is_active;
    if (updates.featured !== undefined) payload.featured = updates.featured;

    if (updates.category_id !== undefined) {
      const uuid = await resolveCategoryUuid(updates.category_id);
      if (uuid) payload.category_id = uuid;
    }

    const categoryUuid = await resolveCategoryUuid(brand.category_id);
    if (!categoryUuid) {
      throw new Error(`Category "${brand.category_id}" not found in database`);
    }

    const { error } = await supabase
      .from("brands")
      .update(payload)
      .eq("slug", brand.slug)
      .eq("category_id", categoryUuid);

    if (error) throw error;

    // Refresh cache after successful update
    invalidateCatalogCache();
    await loadCatalog(true);
  } catch (err: any) {
    console.error("Supabase error:", {
      message: err?.message,
      details: err?.details,
      hint: err?.hint,
      code: err?.code,
      fullError: JSON.stringify(err, null, 2)
    });
    
    throw new Error(err?.message || JSON.stringify(err) || "Unknown error");
  }
}

export async function deleteBrand(id: string): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  try {
    const catalog = getCatalogSync();
    const brand = catalog.brands.find((b) => b.id === id);
    if (!brand) {
      throw new Error("Brand not found locally");
    }

    const { error } = await supabase
      .from("brands")
      .delete()
      .eq("id", brand.id);

    if (error) throw error;

    // Refresh cache after successful delete
    invalidateCatalogCache();
    await loadCatalog(true);
  } catch (err: any) {
    console.error("Supabase error:", {
      message: err?.message,
      details: err?.details,
      hint: err?.hint,
      code: err?.code,
      fullError: JSON.stringify(err, null, 2)
    });
    
    throw new Error(err?.message || JSON.stringify(err) || "Unknown error");
  }
}

export const loadAdminCatalog = getCatalogSync;
export const getStoredCategories = () => getCatalogSync().categories;
export const getStoredBrands = () => getCatalogSync().brands;
export const saveStoredCategories = (categories: Category[]) => {
  const catalog = memoryCache || buildDefaultCatalog();
  memoryCache = { categories, brands: catalog.brands };
};
export const saveStoredBrands = (brands: Brand[]) => {
  const catalog = memoryCache || buildDefaultCatalog();
  memoryCache = { categories: catalog.categories, brands };
};
export const updateStoredCategory = (id: string, updates: Partial<Category>) => {
  void updateCategory(id, updates);
};
export const deleteStoredCategory = (id: string) => {
  void deleteCategory(id);
};
export const updateStoredBrand = (id: string, updates: Partial<Brand>) => {
  void updateBrand(id, updates);
};
export const deleteStoredBrand = (id: string) => {
  void deleteBrand(id);
};
export const addStoredCategory = addCategory;
export const addStoredBrand = addBrand;

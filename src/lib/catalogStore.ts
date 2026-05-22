import { allBrands, categories as defaultCategories } from "@/data/brands";
import { Brand, Category } from "@/types/database";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { slugToProductCategory } from "@/lib/catalogHelpers";

const CATEGORIES_KEY = "colour_seven_categories";
const BRANDS_KEY = "colour_seven_brands";
const CATALOG_CUSTOMIZED_KEY = "colour_seven_catalog_customized";
const CATALOG_SYNC_KEY = "colour_seven_catalog_synced_at";

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

  return { categories, brands };
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

  const { data: catRows, error: catError } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  if (catError) {
    console.error("Supabase categories fetch failed:", catError);
    return null;
  }

  const { data: brandRows, error: brandError } = await supabase
    .from("brands")
    .select("*")
    .order("display_order");

  if (brandError) {
    console.error("Supabase brands fetch failed:", brandError);
    return null;
  }

  const uuidToSlug = new Map<string, string>();
  const categories = (catRows || []).map((row) => {
    const cat = mapRemoteCategory(row as Record<string, unknown>);
    uuidToSlug.set(String(row.id), cat.slug);
    return cat;
  });

  const brands: Brand[] = (brandRows || []).map((row) => {
    const r = row as Record<string, unknown>;
    const categorySlug =
      uuidToSlug.get(String(r.category_id)) || String(r.category_id);
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

  return { categories, brands: normalizeBrands(brands) };
}

async function migrateLocalCatalogToSupabase() {
  if (typeof window === "undefined" || !supabase) return;
  const wasMigrated = localStorage.getItem("colour_seven_catalog_migrated");
  if (wasMigrated === "1") return;

  const customized = localStorage.getItem(CATALOG_CUSTOMIZED_KEY) === "1";
  if (!customized) return;

  try {
    const localCategoriesRaw = localStorage.getItem(CATEGORIES_KEY);
    const localBrandsRaw = localStorage.getItem(BRANDS_KEY);

    const localCategories = localCategoriesRaw ? (JSON.parse(localCategoriesRaw) as Category[]) : [];
    const localBrands = localBrandsRaw ? (JSON.parse(localBrandsRaw) as Brand[]) : [];

    const remoteCatalog = await fetchRemoteCatalog();
    if (!remoteCatalog) {
      console.warn("Could not fetch remote catalog; skipping migration for now.");
      return;
    }
    const remoteCategoriesSlugs = new Set(remoteCatalog.categories.map((c) => c.slug));
    const remoteBrandsSlugs = new Set(remoteCatalog.brands.map((b) => `${b.category_id}::${b.slug}`));

    // 1. Migrate categories
    for (const lc of localCategories) {
      if (remoteCategoriesSlugs.has(lc.slug)) {
        continue;
      }
      await supabase.from("categories").insert({
        name: lc.name,
        slug: lc.slug,
        description: lc.description,
        image: lc.image,
        icon: lc.icon || null,
        display_order: lc.display_order,
        is_active: lc.is_active,
      });
    }

    // Refresh categories mapping to UUID
    const catRowsRes = await supabase.from("categories").select("id, slug");
    const categorySlugToUuid = new Map<string, string>();
    if (catRowsRes.data) {
      catRowsRes.data.forEach((row) => {
        categorySlugToUuid.set(String(row.slug), String(row.id));
      });
    }

    // 2. Migrate brands
    for (const lb of localBrands) {
      const uniqueKey = `${lb.category_id}::${lb.slug}`;
      if (remoteBrandsSlugs.has(uniqueKey)) {
        continue;
      }

      const categoryUuid = categorySlugToUuid.get(lb.category_id);
      if (categoryUuid) {
        await supabase.from("brands").insert({
          category_id: categoryUuid,
          name: lb.name,
          slug: lb.slug,
          logo: lb.logo || null,
          banner: lb.banner || null,
          description: lb.description,
          website: lb.website || null,
          display_order: lb.display_order,
          is_active: lb.is_active,
          featured: lb.featured,
        });
      }
    }

    localStorage.setItem("colour_seven_catalog_migrated", "1");
  } catch (err) {
    console.error("Migration of local catalog failed:", err);
  }
}

export async function loadCatalog(force = false): Promise<CatalogData> {
  if (memoryCache && !force) return memoryCache;

  if (isSupabaseConfigured && supabase) {
    try {
      await migrateLocalCatalogToSupabase();
      const remoteCatalog = await fetchRemoteCatalog();
      if (remoteCatalog !== null) {
        memoryCache = remoteCatalog;
        return remoteCatalog;
      }
    } catch (error) {
      console.error("Failed to load catalog from Supabase:", error);
    }
  }

  if (memoryCache) return memoryCache;

  const defaults = buildDefaultCatalog();
  memoryCache = defaults;
  return defaults;
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

async function resolveCategoryUuid(slug: string): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return data?.id ? String(data.id) : null;
}

export async function addCategory(
  data: Omit<Category, "id" | "created_at" | "updated_at">
): Promise<Category> {
  const now = new Date().toISOString();
  const category: Category = {
    ...data,
    id: data.slug,
    created_at: now,
    updated_at: now,
  };

  if (supabase) {
    try {
      const { error } = await supabase.from("categories").insert({
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        icon: category.icon || null,
        display_order: category.display_order,
        is_active: category.is_active,
      });
      if (error) {
        console.error("Supabase category insert failed:", error.message);
        throw error;
      }
      const remote = await fetchRemoteCatalog();
      if (remote) {
        memoryCache = remote;
        return remote.categories.find((c) => c.slug === category.slug) || category;
      }
    } catch (err) {
      console.error("Failed to insert category in Supabase:", err);
      throw err;
    }
  }

  const catalog = memoryCache || buildDefaultCatalog();
  const next = { ...catalog, categories: [...catalog.categories, category] };
  memoryCache = next;
  return category;
}

export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<void> {
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const payload: Record<string, unknown> = { updated_at: now };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.slug !== undefined) payload.slug = updates.slug;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.image !== undefined) payload.image = updates.image;
      if (updates.icon !== undefined) payload.icon = updates.icon;
      if (updates.display_order !== undefined)
        payload.display_order = updates.display_order;
      if (updates.is_active !== undefined) payload.is_active = updates.is_active;

      const { error } = await supabase
        .from("categories")
        .update(payload)
        .eq("slug", id);
      if (error) {
        console.error("Supabase category update failed:", error.message);
        throw error;
      }
      const remote = await fetchRemoteCatalog();
      if (remote) {
        memoryCache = remote;
        return;
      }
    } catch (err) {
      console.error("Failed to update category in Supabase:", err);
      throw err;
    }
  }

  const catalog = memoryCache || buildDefaultCatalog();
  const next = {
    ...catalog,
    categories: catalog.categories.map((c) =>
      c.id === id ? { ...c, ...updates, updated_at: now } : c
    ),
  };
  memoryCache = next;
}

export async function deleteCategory(id: string): Promise<void> {
  if (supabase) {
    try {
      const { error } = await supabase.from("categories").delete().eq("slug", id);
      if (error) {
        console.error("Supabase category delete failed:", error.message);
        throw error;
      }
      const remote = await fetchRemoteCatalog();
      if (remote) {
        memoryCache = remote;
        return;
      }
    } catch (err) {
      console.error("Failed to delete category in Supabase:", err);
      throw err;
    }
  }

  const catalog = memoryCache || buildDefaultCatalog();
  const next = {
    categories: catalog.categories.filter((c) => c.id !== id),
    brands: catalog.brands.filter((b) => b.category_id !== id),
  };
  memoryCache = next;
}

export async function addBrand(
  data: Omit<Brand, "id" | "created_at" | "updated_at"> & {
    name: string;
    category_id: string;
  }
): Promise<Brand> {
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

  if (supabase) {
    try {
      const categoryUuid = await resolveCategoryUuid(data.category_id);
      if (categoryUuid) {
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
        if (error) {
          console.error("Supabase brand insert failed:", error.message);
          throw error;
        }
        const remote = await fetchRemoteCatalog();
        if (remote) {
          memoryCache = remote;
          return remote.brands.find((b) => b.id === brand.id) || brand;
        }
      } else {
        console.warn("Category UUID not found in database for category:", data.category_id);
      }
    } catch (err) {
      console.error("Failed to insert brand in Supabase:", err);
      throw err;
    }
  }

  const catalog = memoryCache || buildDefaultCatalog();
  const next = { ...catalog, brands: [...catalog.brands, brand] };
  memoryCache = next;
  return brand;
}

export async function updateBrand(
  id: string,
  updates: Partial<Brand>
): Promise<void> {
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const catalog = memoryCache || buildDefaultCatalog();
      const brand = catalog.brands.find((b) => b.id === id);
      if (brand) {
        const payload: Record<string, unknown> = { updated_at: now };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.slug !== undefined) payload.slug = updates.slug;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.logo !== undefined) payload.logo = updates.logo;
        if (updates.banner !== undefined) payload.banner = updates.banner;
        if (updates.website !== undefined) payload.website = updates.website;
        if (updates.display_order !== undefined)
          payload.display_order = updates.display_order;
        if (updates.is_active !== undefined) payload.is_active = updates.is_active;
        if (updates.featured !== undefined) payload.featured = updates.featured;

        if (updates.category_id !== undefined) {
          const uuid = await resolveCategoryUuid(updates.category_id);
          if (uuid) {
            payload.category_id = uuid;
          }
        }

        const categoryUuid = await resolveCategoryUuid(brand.category_id);
        if (categoryUuid) {
          const { error } = await supabase
            .from("brands")
            .update(payload)
            .eq("slug", brand.slug)
            .eq("category_id", categoryUuid);
          if (error) {
            console.error("Supabase brand update failed:", error.message);
            throw error;
          }
          const remote = await fetchRemoteCatalog();
          if (remote) {
            memoryCache = remote;
            return;
          }
        }
      }
    } catch (err) {
      console.error("Failed to update brand in Supabase:", err);
      throw err;
    }
  }

  const catalog = memoryCache || buildDefaultCatalog();
  const next = {
    ...catalog,
    brands: catalog.brands.map((b) =>
      b.id === id ? { ...b, ...updates, updated_at: now } : b
    ),
  };
  memoryCache = next;
}

export async function deleteBrand(id: string): Promise<void> {
  if (supabase) {
    try {
      const catalog = memoryCache || buildDefaultCatalog();
      const brand = catalog.brands.find((b) => b.id === id);
      if (brand) {
        const categoryUuid = await resolveCategoryUuid(brand.category_id);
        if (categoryUuid) {
          const { error } = await supabase
            .from("brands")
            .delete()
            .eq("slug", brand.slug)
            .eq("category_id", categoryUuid);
          if (error) {
            console.error("Supabase brand delete failed:", error.message);
            throw error;
          }
          const remote = await fetchRemoteCatalog();
          if (remote) {
            memoryCache = remote;
            return;
          }
        }
      }
    } catch (err) {
      console.error("Failed to delete brand from Supabase:", err);
      throw err;
    }
  }

  const catalog = memoryCache || buildDefaultCatalog();
  const next = {
    ...catalog,
    brands: catalog.brands.filter((b) => b.id !== id),
  };
  memoryCache = next;
}

/** @deprecated Use loadCatalog — kept for gradual migration */
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

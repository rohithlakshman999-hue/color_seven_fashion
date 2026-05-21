import { allBrands, categories as defaultCategories } from "@/data/brands";
import { Brand, Category } from "@/types/database";

const CATEGORIES_KEY = "colour_seven_categories";
const BRANDS_KEY = "colour_seven_brands";
const BRANDS_VERSION_KEY = "colour_seven_brands_version";
const BRANDS_STORAGE_VERSION = 3;

let categoriesCache: Category[] | null = null;
let brandsCache: Brand[] | null = null;

export function invalidateCatalogCache() {
  categoriesCache = null;
  brandsCache = null;
}

export function slugifyName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function buildBrandId(categoryId: string, name: string): string {
  return `${categoryId}-${slugifyName(name)}`;
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
    return {
      ...b,
      id,
      slug: slugifyName(b.name),
      updated_at: b.updated_at,
    };
  });
}

function persistIfChanged(original: Brand[], normalized: Brand[]) {
  const changed =
    original.length !== normalized.length ||
    original.some((b, i) => b.id !== normalized[i]?.id);
  if (changed) {
    if (typeof window !== "undefined") {
      localStorage.setItem(BRANDS_KEY, JSON.stringify(normalized));
    }
    brandsCache = normalized;
  }
}

export const getStoredCategories = (): Category[] => {
  if (typeof window === "undefined") return [];
  if (categoriesCache) return categoriesCache;

  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Category[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        categoriesCache = parsed;
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse stored categories:", e);
    }
  }

  const initial = defaultCategories.map((c, index) => ({
    id: c.slug,
    name: c.name,
    slug: c.slug,
    description: c.description || "",
    image: "",
    icon: "",
    display_order: index,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(initial));
  categoriesCache = initial;
  return initial;
};

export const saveStoredCategories = (categories: Category[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  categoriesCache = categories;
};

export const getStoredBrands = (): Brand[] => {
  if (typeof window === "undefined") return [];
  if (brandsCache) return brandsCache;

  const storedVersion = localStorage.getItem(BRANDS_VERSION_KEY);
  if (storedVersion !== String(BRANDS_STORAGE_VERSION)) {
    localStorage.removeItem(BRANDS_KEY);
    localStorage.setItem(BRANDS_VERSION_KEY, String(BRANDS_STORAGE_VERSION));
  }

  const stored = localStorage.getItem(BRANDS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Brand[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = normalizeBrands(parsed);
        persistIfChanged(parsed, normalized);
        brandsCache = normalized;
        return normalized;
      }
    } catch (e) {
      console.error("Failed to parse stored brands:", e);
    }
  }

  const initial: Brand[] = allBrands.map((b, index) => {
    const categoryId = b.category.toLowerCase();
    const id = buildBrandId(categoryId, b.name);
    return {
      id,
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
  localStorage.setItem(BRANDS_KEY, JSON.stringify(initial));
  localStorage.setItem(BRANDS_VERSION_KEY, String(BRANDS_STORAGE_VERSION));
  brandsCache = initial;
  return initial;
};

export const saveStoredBrands = (brands: Brand[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
  brandsCache = brands;
};

export const loadAdminCatalog = () => {
  const categories = getStoredCategories().sort(
    (a, b) => a.display_order - b.display_order
  );
  const brands = getStoredBrands().sort(
    (a, b) => a.display_order - b.display_order
  );
  return { categories, brands };
};

export function getCategoryBySlug(slug: string): Category | undefined {
  return getStoredCategories().find((c) => c.slug === slug);
}

export function getBrandsForCategorySlug(slug: string): Brand[] {
  const category = getCategoryBySlug(slug);
  if (!category) return [];
  return getStoredBrands().filter(
    (b) => b.category_id === category.id && b.is_active !== false
  );
}

export function getBrandBySlug(
  categorySlug: string,
  brandSlug: string
): Brand | undefined {
  const category = getCategoryBySlug(categorySlug);
  const brands = getStoredBrands();
  return brands.find(
    (b) =>
      b.slug === brandSlug &&
      (!category || b.category_id === category.id)
  );
}

export const updateStoredCategory = (
  id: string,
  updates: Partial<Category>
) => {
  const categories = getStoredCategories();
  const next = categories.map((c) =>
    c.id === id
      ? { ...c, ...updates, updated_at: new Date().toISOString() }
      : c
  );
  saveStoredCategories(next);
  return next;
};

export const deleteStoredCategory = (id: string) => {
  const categories = getStoredCategories().filter((c) => c.id !== id);
  saveStoredCategories(categories);
  const brands = getStoredBrands().filter((b) => b.category_id !== id);
  saveStoredBrands(brands);
  return { categories, brands };
};

export const updateStoredBrand = (id: string, updates: Partial<Brand>) => {
  const brands = getStoredBrands();
  const next = brands.map((b) =>
    b.id === id
      ? { ...b, ...updates, updated_at: new Date().toISOString() }
      : b
  );
  saveStoredBrands(next);
  return next;
};

export const deleteStoredBrand = (id: string) => {
  const brands = getStoredBrands().filter((b) => b.id !== id);
  saveStoredBrands(brands);
  return brands;
};

export const getBrandById = (id: string): Brand | undefined => {
  return getStoredBrands().find((b) => b.id === id);
};

export const addStoredCategory = (
  data: Omit<Category, "id" | "created_at" | "updated_at">
) => {
  const categories = getStoredCategories();
  const now = new Date().toISOString();
  const category: Category = {
    ...data,
    id: data.slug,
    created_at: now,
    updated_at: now,
  };
  saveStoredCategories([...categories, category]);
  return category;
};

export const addStoredBrand = (
  data: Omit<Brand, "id" | "created_at" | "updated_at"> & {
    name: string;
    category_id: string;
  }
) => {
  const brands = getStoredBrands();
  const now = new Date().toISOString();
  const id = buildBrandId(data.category_id, data.name);
  const brand: Brand = {
    id,
    category_id: data.category_id,
    name: data.name,
    slug: data.slug || slugifyName(data.name),
    logo: data.logo || "",
    banner: data.banner || "",
    description: data.description || "",
    website: data.website,
    display_order: data.display_order ?? brands.length,
    is_active: data.is_active ?? true,
    featured: data.featured ?? false,
    created_at: now,
    updated_at: now,
  };
  saveStoredBrands([...brands, brand]);
  return brand;
};

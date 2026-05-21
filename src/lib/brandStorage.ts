import { allBrands, categories as defaultCategories, brandsByCategory } from "@/data/brands";
import { Brand, Category } from "@/types/database";

const CATEGORIES_KEY = "colour_seven_categories";
const BRANDS_KEY = "colour_seven_brands";

export const getStoredCategories = (): Category[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored categories:", e);
    }
  }

  // Initialize
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
  return initial;
};

export const saveStoredCategories = (categories: Category[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const getStoredBrands = (): Brand[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(BRANDS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored brands:", e);
    }
  }

  // Initialize
  const initial: Brand[] = [
    ...allBrands.map((b, index) => ({
      id: b.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      category_id: b.category === "clothing" ? "clothing" : b.category.toLowerCase(),
      name: b.name,
      slug: b.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      logo: `/images/brands/${b.name.toLowerCase().replace(/\s+/g, "_")}.png`,
      banner: "",
      description: b.description || `Premium products from ${b.name}`,
      display_order: index,
      is_active: true,
      featured: b.featured || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    ...brandsByCategory.shoes.map((b, index) => ({
      id: b.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      category_id: "shoes",
      name: b.name,
      slug: b.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      logo: `/images/brands/${b.name.toLowerCase().replace(/\s+/g, "_")}.png`,
      banner: "",
      description: b.description || `Premium shoes from ${b.name}`,
      display_order: allBrands.length + index,
      is_active: true,
      featured: b.featured || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  ];
  localStorage.setItem(BRANDS_KEY, JSON.stringify(initial));
  return initial;
};

export const saveStoredBrands = (brands: Brand[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
};

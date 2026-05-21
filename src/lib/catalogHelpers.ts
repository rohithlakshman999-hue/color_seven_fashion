import type { Product } from "@/context/ProductContext";
import type { Brand } from "@/types/database";

export { brandOptionKey } from "@/lib/catalogStore";

export const PRODUCT_CATEGORIES = [
  "Watches",
  "Shoes",
  "Clothes",
  "Accessories",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

const SLUG_TO_CATEGORY: Record<string, ProductCategory> = {
  watches: "Watches",
  shoes: "Shoes",
  clothing: "Clothes",
  clothes: "Clothes",
  accessories: "Accessories",
  bags: "Accessories",
  perfumes: "Accessories",
  sunglasses: "Accessories",
  electronics: "Accessories",
};

const CATEGORY_TO_SLUG: Record<ProductCategory, string> = {
  Watches: "watches",
  Shoes: "shoes",
  Clothes: "clothing",
  Accessories: "accessories",
};

export function slugToProductCategory(slug: string): ProductCategory {
  return SLUG_TO_CATEGORY[slug] || "Accessories";
}

export function productCategoryToSlug(category: ProductCategory): string {
  return CATEGORY_TO_SLUG[category];
}

export function getBrandsForProductCategory(
  category: ProductCategory,
  brands: Brand[]
): Brand[] {
  const slug = productCategoryToSlug(category);
  return brands.filter(
    (b) => b.category_id === slug && b.is_active !== false
  );
}

export const ADMIN_SELECT_CLASS =
  "w-full bg-zinc-900 border border-white/20 rounded-lg px-4 py-3 text-white font-bold focus:border-[#c9a227] focus:outline-none transition-colors appearance-none cursor-pointer";

export const ADMIN_OPTION_CLASS = "bg-zinc-900 text-white font-semibold";

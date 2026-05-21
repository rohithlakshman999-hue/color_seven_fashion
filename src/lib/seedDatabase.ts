// This file provides helper functions to seed the database with initial data
// Run this from the admin panel or use it as a reference

import { supabase } from "@/lib/supabase";
import { allBrands, categories } from "@/data/brands";
import { buildBrandId, slugifyName } from "@/lib/brandStorage";

export async function seedCategories() {
  if (!supabase) {
    console.error("Supabase is not configured");
    return;
  }
  try {
    console.log("Seeding categories...");

    for (const cat of categories) {
      const { error } = await supabase.from("categories").insert([
        {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          display_order: categories.indexOf(cat),
          is_active: true,
        },
      ]);

      if (error && !error.message.includes("duplicate")) {
        console.error(`Error creating category ${cat.name}:`, error);
      }
    }

    console.log("Categories seeded successfully");
  } catch (error) {
    console.error("Failed to seed categories:", error);
  }
}

export async function seedBrands() {
  if (!supabase) {
    console.error("Supabase is not configured");
    return;
  }
  try {
    console.log("Seeding brands...");

    // Get all categories
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id, slug");

    if (!categoriesData) {
      console.error("No categories found");
      return;
    }

    const categoryMap = Object.fromEntries(
      categoriesData.map((c: any) => [c.slug, c.id])
    );

    // Seed brands
    for (const brand of allBrands) {
      const categoryId = categoryMap[brand.category];
      if (!categoryId) {
        console.warn(`Category not found for brand: ${brand.name}`);
        continue;
      }

      const slug = buildBrandId(brand.category, brand.name);

      const { error } = await supabase.from("brands").insert([
        {
          category_id: categoryId,
          name: brand.name,
          slug: slugifyName(brand.name),
          description: brand.description,
          display_order: 0,
          is_active: true,
          featured: brand.featured || false,
        },
      ]);

      if (error && !error.message.includes("duplicate")) {
        console.error(`Error creating brand ${brand.name}:`, error);
      }
    }

    console.log("Brands seeded successfully");
  } catch (error) {
    console.error("Failed to seed brands:", error);
  }
}

export async function seedDatabase() {
  console.log("Starting database seeding...");
  await seedCategories();
  await seedBrands();
  console.log("Database seeding completed!");
}

// Export brand list for reference
export const brandsList = allBrands.map((b) => ({
  name: b.name,
  category: b.category,
  featured: b.featured,
}));

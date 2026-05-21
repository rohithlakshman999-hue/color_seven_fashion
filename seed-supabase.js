const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || "";
    if (val.length > 0 && val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const categories = [
  { name: "Watches", slug: "watches", description: "Luxury and casual timepieces from world-renowned brands" },
  { name: "Clothing", slug: "clothing", description: "Premium fashion apparel and streetwear collections" },
  { name: "Shoes", slug: "shoes", description: "Designer and premium footwear" },
  { name: "Accessories", slug: "accessories", description: "Luxury bags, jewelry, and accessories" }
];

const allBrands = [
  // WATCHES BRANDS - Comprehensive List
  { name: "Armani Men", category: "watches", description: "Elegant men's timepieces from Italian fashion house", featured: true },
  { name: "Armani Womens", category: "watches", description: "Sophisticated women's watches from Armani", featured: true },
  { name: "Audemars Piguet AP", category: "watches", description: "Ultra-luxury Swiss watches - Royal Oak collection", featured: true },
  { name: "Breitling", category: "watches", description: "Swiss luxury aviation chronographs", featured: true },
  { name: "Burberry Women's", category: "watches", description: "British luxury watches for women", featured: true },
  { name: "Bvlgari", category: "watches", description: "Italian luxury jewelry watches", featured: true },
  { name: "Bvlgari Women", category: "watches", description: "Elegant women's luxury timepieces", featured: true },
  { name: "Calvin Klein", category: "watches", description: "Minimalist contemporary timepieces", featured: true },
  { name: "Calvin Klein Women's", category: "watches", description: "Women's minimalist designer watches", featured: true },
  { name: "Cartier", category: "watches", description: "Iconic French luxury jewelry watches", featured: true },
  { name: "Cartier / Patek / Breitling Collections", category: "watches", description: "Premium collection of luxury watch brands", featured: true },
  { name: "Casio", category: "watches", description: "Reliable Japanese digital and analog watches", featured: false },
  { name: "Citizen", category: "watches", description: "Eco-drive solar technology watches", featured: false },
  { name: "Diesel 10 Bar", category: "watches", description: "Bold industrial watches with 10 bar water resistance", featured: false },
  { name: "Diesel Big Daddy", category: "watches", description: "Oversized statement watches from Diesel", featured: false },
  { name: "DW", category: "watches", description: "Daniel Wellington minimalist elegant watches", featured: true },
  { name: "DW New M Leather", category: "watches", description: "Daniel Wellington with premium leather straps", featured: true },
  { name: "DW Women", category: "watches", description: "Daniel Wellington collection for women", featured: true },
  { name: "Ferrari", category: "watches", description: "Scuderia Ferrari racing performance timepieces", featured: true },
  { name: "Fossil Men's", category: "watches", description: "Contemporary American men's watches", featured: true },
  { name: "Fossil Women's", category: "watches", description: "Stylish women's watches from Fossil", featured: true },
  { name: "G-Shock", category: "watches", description: "Indestructible sports watches from Casio", featured: true },
  { name: "Gadget", category: "watches", description: "Tech-enabled smart watches and gadgets", featured: false },
  { name: "Graham Men's", category: "watches", description: "British luxury chronograph watches", featured: false },
  { name: "Gucci Women", category: "watches", description: "Luxury Italian women's fashion watches", featured: true },
  { name: "Hublot Fibre", category: "watches", description: "Hublot with innovative fibre materials", featured: true },
  { name: "Hublot Metal", category: "watches", description: "Luxury Swiss metal watches from Hublot", featured: true },
  { name: "Hugo Boss Men", category: "watches", description: "Premium German business fashion watches", featured: true },
  { name: "Longines", category: "watches", description: "Swiss elegance and precision timepieces", featured: true },
  { name: "Maserati Men's", category: "watches", description: "Italian sports luxury watches for men", featured: true },
  { name: "Michael Kors Women", category: "watches", description: "Glamorous designer watches for women", featured: true },
  { name: "MK Chronograph", category: "watches", description: "Michael Kors chronograph collection", featured: true },
  { name: "MK Men's", category: "watches", description: "Michael Kors watches for men", featured: true },
  { name: "Mont Blanc", category: "watches", description: "Luxury German crafted writing instruments and watches", featured: true },
  { name: "Movado Men", category: "watches", description: "Swiss minimalist museum dial watches", featured: false },
  { name: "Omega", category: "watches", description: "Legendary Swiss luxury speedmasters", featured: true },
  { name: "Oris Men", category: "watches", description: "Independent Swiss mechanical watches for men", featured: false },
  { name: "Patek Philippe", category: "watches", description: "Prestigious Swiss luxury watches", featured: true },
  { name: "Rado Ladies", category: "watches", description: "High-tech ceramic watches for women", featured: false },
  { name: "Rado Men", category: "watches", description: "High-tech ceramic watches for men", featured: false },
  { name: "Richard Mille", category: "watches", description: "Avant-garde luxury mechanical watches", featured: true },
  { name: "Rolex Women's", category: "watches", description: "Timeless luxury Swiss watches for women", featured: true },
  { name: "Rolex New 5 Nov", category: "watches", description: "Latest Rolex collection", featured: true },
  { name: "RX", category: "watches", description: "Contemporary watch collection", featured: false },
  { name: "RX Men's New", category: "watches", description: "New men's RX watch collection", featured: false },
  { name: "Seiko Men", category: "watches", description: "Reliable Japanese timepieces for men", featured: false },
  { name: "Tag Heuer", category: "watches", description: "Swiss precision sports watches", featured: true },
  { name: "Tissot", category: "watches", description: "Traditional Swiss watchmaking", featured: true },
  { name: "Tommy Hilfiger", category: "watches", description: "Classic American casual wear watches", featured: true },
  { name: "Tommy Hilfiger Women", category: "watches", description: "Tommy Hilfiger watches for women", featured: true },
  { name: "Versace Men", category: "watches", description: "Bold designer watches for men", featured: true },
  { name: "Versace Women", category: "watches", description: "Luxury Italian watches for women", featured: true },
  { name: "Vintage Casio", category: "watches", description: "Retro classic Casio timepieces", featured: false },
  { name: "Women's Watches", category: "watches", description: "Collection of women's luxury watches", featured: true },

  // CLOTHING BRANDS
  { name: "Armani", category: "clothing", description: "Italian luxury fashion", featured: true },
  { name: "Calvin Klein", category: "clothing", description: "American minimalist fashion", featured: true },
  { name: "Tommy Hilfiger", category: "clothing", description: "Classic American casual wear", featured: true },
  { name: "Hugo Boss", category: "clothing", description: "Premium German business fashion", featured: true },
  { name: "Diesel", category: "clothing", description: "Bold Italian denim", featured: true },
  { name: "Versace", category: "clothing", description: "Iconic Italian luxury wear", featured: true },
  { name: "Gucci", category: "clothing", description: "Luxury Italian fashion", featured: true },
  { name: "Bvlgari", category: "clothing", description: "Luxury Italian brand", featured: true },
  { name: "Ferrari", category: "clothing", description: "Performance luxury apparel", featured: true },
  { name: "Burberry", category: "clothing", description: "British luxury fashion", featured: true },

  // ACCESSORIES BRANDS
  { name: "Gucci", category: "accessories", description: "Luxury accessories", featured: true },
  { name: "Cartier", category: "accessories", description: "Luxury jewelry and accessories", featured: true },
  { name: "Versace", category: "accessories", description: "Italian luxury accessories", featured: true },
  { name: "Bvlgari", category: "accessories", description: "Luxury jewelry accessories", featured: true },
  { name: "Mont Blanc", category: "accessories", description: "Luxury writing instruments", featured: true },
  { name: "Diesel", category: "accessories", description: "Bold fashion accessories", featured: false },
  { name: "Tommy Hilfiger", category: "accessories", description: "Classic accessories", featured: false },

  // SHOES BRANDS
  { name: "Nike", category: "shoes", description: "Iconic athletic footwear", featured: true },
  { name: "Adidas", category: "shoes", description: "Performance sports footwear", featured: true },
  { name: "Gucci", category: "shoes", description: "Luxury Italian footwear", featured: true },
  { name: "Versace", category: "shoes", description: "Designer luxury footwear", featured: true },
  { name: "Diesel", category: "shoes", description: "Bold fashion footwear", featured: false }
];

async function seed() {
  console.log("Seeding Supabase categories & brands...");

  // Seed Categories
  console.log("Inserting categories...");
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const { data, error } = await supabase.from("categories").upsert(
      {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        display_order: i,
        is_active: true
      },
      { onConflict: "slug" }
    ).select();

    if (error) {
      console.error(`Error seeding category ${cat.name}:`, error.message);
    } else {
      console.log(`✓ Seeded Category: ${cat.name}`);
    }
  }

  // Get categories to map IDs
  const { data: catData, error: catErr } = await supabase.from("categories").select("id, slug");
  if (catErr || !catData) {
    console.error("Failed to query categories:", catErr?.message);
    return;
  }

  const categoryMap = {};
  catData.forEach((c) => {
    categoryMap[c.slug] = c.id;
  });

  // Seed Brands
  console.log("Inserting brands...");
  const { data: existingBrands, error: existingBrandsErr } = await supabase.from("brands").select("slug");
  if (existingBrandsErr) {
    console.error("Failed to query existing brands:", existingBrandsErr.message);
    return;
  }
  const existingSlugs = new Set((existingBrands || []).map((b) => b.slug));

  for (let i = 0; i < allBrands.length; i++) {
    const brand = allBrands[i];
    const categoryId = categoryMap[brand.category];
    if (!categoryId) {
      console.warn(`Category not found for brand: ${brand.name} (${brand.category})`);
      continue;
    }

    const slug = brand.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    if (existingSlugs.has(slug)) {
      console.log(`- Brand already exists: ${brand.name}`);
      continue;
    }

    const { error } = await supabase.from("brands").insert(
      {
        category_id: categoryId,
        name: brand.name,
        slug: slug,
        description: brand.description,
        display_order: i,
        is_active: true,
        featured: brand.featured
      }
    );

    if (error) {
      console.error(`Error seeding brand ${brand.name}:`, error.message);
    } else {
      console.log(`✓ Seeded Brand: ${brand.name}`);
    }
  }

  console.log("Database seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
});

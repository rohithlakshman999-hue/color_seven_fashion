// All Brands Database - Extracted from User Reference
export const allBrands = [
  { name: "Armani Men", category: "watches", description: "Premium Armani men's timepieces", featured: false },
  { name: "Armani Womens", category: "watches", description: "Elegant Armani women's timepieces", featured: false },
  { name: "Audemars Piguet AP", category: "watches", description: "Ultra-luxury Swiss Audemars Piguet AP watches", featured: true },
  { name: "Breitling", category: "watches", description: "Swiss luxury Breitling aviation chronographs", featured: true },
  { name: "Burberry Women’s", category: "watches", description: "Premium Burberry women's watches", featured: false },
  { name: "Bvlgari", category: "watches", description: "Italian luxury Bvlgari timepieces", featured: false },
  { name: "Bvlgari Women", category: "watches", description: "Italian luxury Bvlgari women's timepieces", featured: false },
  { name: "Calvin Klein", category: "watches", description: "Minimalist Calvin Klein timepieces", featured: false },
  { name: "Calvin Klein Women's", category: "watches", description: "Minimalist Calvin Klein women's timepieces", featured: false },
  { name: "Cartier", category: "watches", description: "Iconic luxury Cartier jewelry watches", featured: true },
  { name: "Cartier/PATEK/Breitling...", category: "watches", description: "Curated Cartier, Patek, and Breitling collection", featured: false },
  { name: "Casio", category: "watches", description: "Reliable Japanese Casio timepieces", featured: false },
  { name: "Citizen", category: "watches", description: "Eco-drive Citizen solar watches", featured: false },
  { name: "Diesel 10 Bar", category: "watches", description: "Bold industrial Diesel 10 Bar watches", featured: false },
  { name: "Diesel Big Daddy", category: "watches", description: "Oversized Diesel Big Daddy signature watches", featured: false },
  { name: "DW", category: "watches", description: "Minimalist Daniel Wellington watches", featured: false },
  { name: "DW NEW M LEATHER", category: "watches", description: "Daniel Wellington leather strap collection", featured: false },
  { name: "DW WOMEN", category: "watches", description: "Daniel Wellington women's collection", featured: false },
  { name: "Ferrari", category: "watches", description: "Scuderia Ferrari racing performance timepieces", featured: false },
  { name: "Fossil Men’s", category: "watches", description: "Contemporary Fossil men's timepieces", featured: false },
  { name: "Fossil Women", category: "watches", description: "Elegant Fossil women's timepieces", featured: false },
  { name: "G-Shock", category: "watches", description: "Indestructible G-Shock sports watches", featured: true },
  { name: "GADGET", category: "watches", description: "Smart wearables and tech gadgets", featured: false },
  { name: "Graham Men's", category: "watches", description: "Luxury Graham British watchmaking timepieces", featured: false },
  { name: "Gucci Women", category: "watches", description: "Italian designer Gucci women's watches", featured: false },
  { name: "HUBLOT FIBRE", category: "watches", description: "Carbon fiber Hublot racing edition watches", featured: false },
  { name: "HUBLOT METAL", category: "watches", description: "Metal fusion luxury Hublot watches", featured: false },
  { name: "Hugoboss Men", category: "watches", description: "Premium Hugo Boss men's timepieces", featured: false },
  { name: "Longines", category: "watches", description: "Swiss elegance and precision Longines watches", featured: false },
  { name: "Maserati Men's", category: "watches", description: "Italian sports luxury Maserati men's watches", featured: false },
  { name: "Michael Kors W", category: "watches", description: "Glamorous Michael Kors women's watches", featured: false },
  { name: "MK Chronograph", category: "watches", description: "Michael Kors chronograph edition watches", featured: false },
  { name: "MK Men’s", category: "watches", description: "Contemporary Michael Kors men's watches", featured: false },
  { name: "Mont Blanc", category: "watches", description: "Luxury German crafted Mont Blanc watches", featured: false },
  { name: "Movado Men", category: "watches", description: "Iconic museum dial Movado men's watches", featured: false },
  { name: "Omega", category: "watches", description: "Legendary Swiss luxury Omega speedmasters", featured: true },
  { name: "Oris Men", category: "watches", description: "Independent Swiss mechanical Oris men's watches", featured: false },
  { name: "Patek phillipe", category: "watches", description: "Prestigious Swiss luxury Patek Philippe watches", featured: true },
  { name: "RADO LADIES", category: "watches", description: "High-tech ceramic Rado ladies' watches", featured: false },
  { name: "Rado Men", category: "watches", description: "High-tech ceramic Rado men's watches", featured: false },
  { name: "Richard Mille", category: "watches", description: "Avant-garde luxury mechanical Richard Mille watches", featured: true },
  { name: "Rolex Women’s", category: "watches", description: "Timeless luxury Rolex women's watches", featured: false },
  { name: "ROLX NEW 5 NOV", category: "watches", description: "New arrivals Rolex premium collection", featured: false },
  { name: "RX", category: "watches", description: "RX luxury watch collection", featured: false },
  { name: "RX Men’s New!", category: "watches", description: "RX men's new release watches", featured: false },
  { name: "Seiko Men", category: "watches", description: "Reliable Japanese Seiko men's timepieces", featured: false },
  { name: "Tag Heuer", category: "watches", description: "Swiss precision Tag Heuer sports watches", featured: true },
  { name: "TISSOT", category: "watches", description: "Traditional Swiss watchmaking Tissot watches", featured: false },
  { name: "Tommy Hilfiger", category: "watches", description: "Classic preppy Tommy Hilfiger watches", featured: false },
  { name: "Tommy Hilfiger...", category: "watches", description: "Classic preppy Tommy Hilfiger watches", featured: false },
  { name: "Versace men", category: "watches", description: "Bold designer Versace men's watches", featured: false },
  { name: "Versace women", category: "watches", description: "Glamorous designer Versace women's watches", featured: false },
  { name: "VINTAGE CASIO", category: "watches", description: "Retro classic digital Casio watches", featured: false },
  { name: "Women's Watches", category: "watches", description: "Curated premium women's watch collection", featured: false }
];

export const brandsByCategory = {
  watches: allBrands,
  clothing: [],
  accessories: [],
  shoes: []
};

export const categories = [
  { name: "Watches", slug: "watches", description: "Luxury and casual timepieces from world-renowned brands" },
  { name: "Clothing", slug: "clothing", description: "Premium fashion apparel and streetwear collections" },
  { name: "Shoes", slug: "shoes", description: "Designer and premium footwear" },
  { name: "Accessories", slug: "accessories", description: "Luxury bags, jewelry, and accessories" },
  { name: "Bags", slug: "bags", description: "Designer bags and luggage" },
  { name: "Perfumes", slug: "perfumes", description: "Luxury fragrances and scents" },
  { name: "Sunglasses", slug: "sunglasses", description: "Designer sunglasses and eyewear" },
  { name: "Electronics", slug: "electronics", description: "Premium tech gadgets" }
];

// Helper function to get brand slug
export const getBrandSlug = (brandName: string): string => {
  return brandName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
};

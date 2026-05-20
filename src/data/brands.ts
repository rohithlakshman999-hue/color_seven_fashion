// All Brands Database - Extracted from Reference Image

export const allBrands = [
  // WATCHES BRANDS
  {
    name: "Rolex",
    category: "watches",
    description: "Premium Swiss luxury watches",
    featured: true,
  },
  {
    name: "Casio",
    category: "watches",
    description: "Japanese precision timepieces",
    featured: false,
  },
  {
    name: "G-Shock",
    category: "watches",
    description: "Durable shock-resistant watches",
    featured: true,
  },
  {
    name: "Armani",
    category: "watches",
    description: "Italian luxury fashion watches",
    featured: true,
  },
  {
    name: "Fossil",
    category: "watches",
    description: "Contemporary American watches",
    featured: true,
  },
  {
    name: "Tissot",
    category: "watches",
    description: "Swiss watchmaking excellence",
    featured: true,
  },
  {
    name: "Tag Heuer",
    category: "watches",
    description: "Precision sports timepieces",
    featured: true,
  },
  {
    name: "Omega",
    category: "watches",
    description: "Swiss luxury chronometers",
    featured: true,
  },
  {
    name: "Hublot",
    category: "watches",
    description: "Fusion of tradition and innovation",
    featured: true,
  },
  {
    name: "Richard Mille",
    category: "watches",
    description: "Ultra-luxury mechanical watches",
    featured: true,
  },
  {
    name: "Cartier",
    category: "watches",
    description: "Iconic luxury jewelry watches",
    featured: true,
  },
  {
    name: "Patek Philippe",
    category: "watches",
    description: "Supreme watchmaking heritage",
    featured: true,
  },
  {
    name: "Seiko",
    category: "watches",
    description: "Reliable Japanese timepieces",
    featured: false,
  },
  {
    name: "Rado",
    category: "watches",
    description: "Swiss ceramics and innovation",
    featured: false,
  },
  {
    name: "Breitling",
    category: "watches",
    description: "Professional pilot watches",
    featured: true,
  },
  {
    name: "Longines",
    category: "watches",
    description: "Swiss elegance and precision",
    featured: true,
  },
  {
    name: "Gucci",
    category: "watches",
    description: "Italian luxury fashion watches",
    featured: true,
  },
  {
    name: "Versace",
    category: "watches",
    description: "Bold Italian luxury timepieces",
    featured: true,
  },
  {
    name: "Tommy Hilfiger",
    category: "watches",
    description: "American classic watches",
    featured: false,
  },
  {
    name: "Michael Kors",
    category: "watches",
    description: "Contemporary luxury watches",
    featured: false,
  },
  {
    name: "Diesel",
    category: "watches",
    description: "Bold industrial timepieces",
    featured: false,
  },
  {
    name: "Ferrari",
    category: "watches",
    description: "Performance luxury watches",
    featured: true,
  },
  {
    name: "Citizen",
    category: "watches",
    description: "Eco-drive solar watches",
    featured: false,
  },
  {
    name: "Audemars Piguet",
    category: "watches",
    description: "Swiss luxury craftsmanship",
    featured: true,
  },
  {
    name: "Maserati",
    category: "watches",
    description: "Italian sports luxury watches",
    featured: true,
  },
  {
    name: "Movado",
    category: "watches",
    description: "Minimalist Swiss watches",
    featured: false,
  },
  {
    name: "Oris",
    category: "watches",
    description: "Independent Swiss watchmaker",
    featured: false,
  },
  {
    name: "Calvin Klein",
    category: "watches",
    description: "Minimalist luxury watches",
    featured: false,
  },
  {
    name: "Hugo Boss",
    category: "watches",
    description: "Contemporary business watches",
    featured: false,
  },
  {
    name: "Mont Blanc",
    category: "watches",
    description: "Luxury German timepieces",
    featured: true,
  },
  {
    name: "Bvlgari",
    category: "watches",
    description: "Italian luxury jewelry watches",
    featured: true,
  },
  {
    name: "DW",
    category: "watches",
    description: "Danish minimalist watches",
    featured: false,
  },

  // CLOTHING BRANDS
  {
    name: "Armani",
    category: "clothing",
    description: "Italian luxury fashion",
    featured: true,
  },
  {
    name: "Calvin Klein",
    category: "clothing",
    description: "American minimalist fashion",
    featured: true,
  },
  {
    name: "Tommy Hilfiger",
    category: "clothing",
    description: "Classic American casual wear",
    featured: true,
  },
  {
    name: "Hugo Boss",
    category: "clothing",
    description: "Premium German business fashion",
    featured: true,
  },
  {
    name: "Diesel",
    category: "clothing",
    description: "Bold Italian denim",
    featured: true,
  },
  {
    name: "Versace",
    category: "clothing",
    description: "Iconic Italian luxury wear",
    featured: true,
  },
  {
    name: "Gucci",
    category: "clothing",
    description: "Luxury Italian fashion",
    featured: true,
  },
  {
    name: "Bvlgari",
    category: "clothing",
    description: "Luxury Italian brand",
    featured: true,
  },
  {
    name: "Ferrari",
    category: "clothing",
    description: "Performance luxury apparel",
    featured: true,
  },
  {
    name: "Burberry",
    category: "clothing",
    description: "British luxury fashion",
    featured: true,
  },

  // ACCESSORIES BRANDS
  {
    name: "Gucci",
    category: "accessories",
    description: "Luxury accessories",
    featured: true,
  },
  {
    name: "Cartier",
    category: "accessories",
    description: "Luxury jewelry and accessories",
    featured: true,
  },
  {
    name: "Versace",
    category: "accessories",
    description: "Italian luxury accessories",
    featured: true,
  },
  {
    name: "Bvlgari",
    category: "accessories",
    description: "Luxury jewelry accessories",
    featured: true,
  },
  {
    name: "Mont Blanc",
    category: "accessories",
    description: "Luxury writing instruments",
    featured: true,
  },
  {
    name: "Diesel",
    category: "accessories",
    description: "Bold fashion accessories",
    featured: false,
  },
  {
    name: "Tommy Hilfiger",
    category: "accessories",
    description: "Classic accessories",
    featured: false,
  },
];

export const brandsByCategory = {
  watches: allBrands.filter((b) => b.category === "watches"),
  clothing: allBrands.filter((b) => b.category === "clothing"),
  accessories: allBrands.filter((b) => b.category === "accessories"),
  shoes: [
    { name: "Nike", description: "Premium athletic footwear", featured: true },
    {
      name: "Adidas",
      description: "Classic sports shoes",
      featured: true,
    },
    {
      name: "Gucci",
      description: "Luxury designer shoes",
      featured: true,
    },
    {
      name: "Versace",
      description: "Italian luxury footwear",
      featured: true,
    },
    {
      name: "Diesel",
      description: "Bold fashion sneakers",
      featured: false,
    },
  ],
};

export const categories = [
  {
    name: "Watches",
    slug: "watches",
    description: "Luxury and casual timepieces from world-renowned brands",
  },
  {
    name: "Clothing",
    slug: "clothing",
    description: "Premium fashion apparel and streetwear collections",
  },
  {
    name: "Shoes",
    slug: "shoes",
    description: "Designer and premium footwear",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Luxury bags, jewelry, and accessories",
  },
  {
    name: "Bags",
    slug: "bags",
    description: "Designer bags and luggage",
  },
  {
    name: "Perfumes",
    slug: "perfumes",
    description: "Luxury fragrances and scents",
  },
  {
    name: "Sunglasses",
    slug: "sunglasses",
    description: "Designer sunglasses and eyewear",
  },
  {
    name: "Electronics",
    slug: "electronics",
    description: "Premium tech gadgets",
  },
];

// Helper function to get brand slug
export const getBrandSlug = (brandName: string): string => {
  return brandName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
};

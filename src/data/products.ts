export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: "Watches" | "Shoes" | "Clothing" | "Accessories";
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  stock: number;
  isNew: boolean;
  isTrending?: boolean;
}

export const products: Product[] = [
  {
    id: "4d8c68fa-dc08-4566-b29e-5981b8b61c3a",
    name: "OVERSIZED HOODIE",
    brand: "Colour Seven",
    price: 1799,
    category: "Clothing",
    stock: 10,
    images: [
      "/images/black_hoodie.png"
    ],
    description: "Premium heavyweight cotton hoodie with an oversized streetwear fit. Featuring double-lined hood and drop shoulders.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Grey", "Beige"],
    isNew: true
  },
  {
    id: "b8b529cd-f674-4cf6-9636-6583cb9a7f57",
    name: "NIKE AIR FORCE 1 '07",
    brand: "Colour Seven",
    price: 8495,
    category: "Shoes",
    stock: 10,
    images: [
      "/images/nike_air_force.png"
    ],
    description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash.",
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["White"],
    isNew: true
  },
  {
    id: "061cd71b-7272-4e48-a6d8-5cb58f25810b",
    name: "OUTLAW CHRONO WATCH",
    brand: "Colour Seven",
    price: 2499,
    category: "Watches",
    stock: 10,
    images: [
      "/images/chrono_watch.png"
    ],
    description: "Signature all-black matte finish chronograph watch. Water-resistant with high-precision quartz movement and calendar function.",
    sizes: ["OS"],
    colors: ["Matte Black"],
    isNew: true
  },
  {
    id: "ba632192-12a5-4327-b6e3-487be0b42a5e",
    name: "OUTLAW CAP",
    brand: "Colour Seven",
    price: 699,
    category: "Accessories",
    stock: 10,
    images: [
      "/images/baseball_cap.png"
    ],
    description: "Classic 6-panel adjustable cotton cap featuring custom Colour Seven front embroidery and steel buckle adjustment.",
    sizes: ["OS"],
    colors: ["Black"],
    isNew: false
  },
  {
    id: "df6fa9ac-f18d-4019-bdd0-7ef5c6d759ea",
    name: "GRAPHIC OVERSIZED TEE",
    brand: "Colour Seven",
    price: 1299,
    category: "Clothing",
    stock: 10,
    images: [
      "/images/graphic_tee.png"
    ],
    description: "Heavyweight drop-shoulder graphic t-shirt with premium front chest typography. Distressed details for a vintage feel.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Washed Black"],
    isNew: true
  },
  {
    id: "9bc11e0b-b509-42d7-97de-d4eaa2b24504",
    name: "CUBAN CHAIN SILVER",
    brand: "Colour Seven",
    price: 1199,
    category: "Accessories",
    stock: 10,
    images: [
      "/images/cuban_chain.png"
    ],
    description: "Vibrant high-polished silver cuban link chain necklace. Hypoallergenic design with durable secure-lock clasp.",
    sizes: ["18\"", "20\"", "22\""],
    colors: ["Silver"],
    isNew: true
  },
  {
    id: "460190e2-1a00-4b57-8a34-6db91691a5f7",
    name: "CLASSIC GOLDEN CHRONOGRAPH",
    brand: "Colour Seven",
    price: 3499,
    category: "Watches",
    stock: 10,
    images: [
      "/images/chrono_watch.png"
    ],
    description: "Premium gold-accented chronograph watch. Featuring a genuine leather strap and dark brushed metallic dial face.",
    sizes: ["OS"],
    colors: ["Gold/Black"],
    isNew: false
  },
  {
    id: "cc236840-6ec1-4ddf-9dd6-f8f75e677289",
    name: "STREETWEAR SNEAKERS",
    brand: "Colour Seven",
    price: 5999,
    category: "Shoes",
    stock: 10,
    images: [
      "/images/nike_air_force.png"
    ],
    description: "Minimalist streetwear sneakers built with vulcanized rubber soles and supportive cushioning for all-day comfort.",
    sizes: ["8", "9", "10", "11"],
    colors: ["White/Black"],
    isNew: false
  },
  {
    id: "2926eddb-418c-4552-8476-5bbba7f0b90d",
    name: "DISTRESSED STREETWEAR JOGGER",
    brand: "Colour Seven",
    price: 2499,
    category: "Clothing",
    stock: 10,
    images: [
      "/images/black_hoodie.png"
    ],
    description: "Comfortable heavyweight fleece joggers with raw-edge distressed details and metal-tipped drawstring cords.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Charcoal Black"],
    isNew: false
  },
  {
    id: "461b43c0-3fb5-470e-8a53-0013c12c369b",
    name: "OUTLAW KNIT BEANIE",
    brand: "Colour Seven",
    price: 899,
    category: "Accessories",
    stock: 10,
    images: [
      "/images/baseball_cap.png"
    ],
    description: "Soft-knit ribbed beanie featuring a Colour Seven woven styling patch. Keeps you warm and stylish all winter.",
    sizes: ["OS"],
    colors: ["Black"],
    isNew: false
  },
  {
    id: "41ab9f69-91c8-4eae-abbd-d7bc4699a0b1",
    name: "RETRO DIVE WATCH",
    brand: "Colour Seven",
    price: 1999,
    category: "Watches",
    stock: 10,
    images: [
      "/images/chrono_watch.png"
    ],
    description: "Vintage-inspired sport dive watch. Built with rotating bezel and luminous hands for visibility in low light.",
    sizes: ["OS"],
    colors: ["Deep Sea Black"],
    isNew: false
  },
  {
    id: "8646ae30-4adc-48f2-9edb-40f22488fc00",
    name: "OUTLAW DUFFLE BAG",
    brand: "Colour Seven",
    price: 3199,
    category: "Accessories",
    stock: 10,
    images: [
      "/images/baseball_cap.png"
    ],
    description: "Heavy duty canvas travel duffle bag. Equipped with waterproof zippers and spacious utility compartments.",
    sizes: ["OS"],
    colors: ["Stealth Black"],
    isNew: true
  }
];

export const collections = [
  {
    id: "88b8f5f7-fcca-45bc-b010-6f3578fdaf0d",
    name: "Watches",
    image: "/images/chrono_watch.png",
    description: "Legendary precision timepieces."
  },
  {
    id: "7fd34c85-f5cb-446d-abd4-1f722db8297f",
    name: "Shoes",
    image: "/images/nike_air_force.png",
    description: "Footwear built for performance and style."
  },
  {
    id: "ed721af0-9491-49b2-94fe-26952e782318",
    name: "Clothing",
    image: "/images/black_hoodie.png",
    description: "Premium streetwear essential apparel."
  },
  {
    id: "13a6fc6f-bad4-4184-94c8-7a5b0ad54c3b",
    name: "Accessories",
    image: "/images/baseball_cap.png",
    description: "Finish your look with outlaw styling."
  }
];

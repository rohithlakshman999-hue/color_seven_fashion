export interface Product {
  id: string;
  name: string;
  price: number;
  category: "Watches" | "Shoes" | "Clothes" | "Accessories";
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  isNew: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "OVERSIZED HOODIE",
    price: 1799,
    category: "Clothes",
    images: [
      "/images/black_hoodie.png"
    ],
    description: "Premium heavyweight cotton hoodie with an oversized streetwear fit. Featuring double-lined hood and drop shoulders.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Grey", "Beige"],
    isNew: true
  },
  {
    id: "2",
    name: "NIKE AIR FORCE 1 '07",
    price: 8495,
    category: "Shoes",
    images: [
      "/images/nike_air_force.png"
    ],
    description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash.",
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["White"],
    isNew: true
  },
  {
    id: "3",
    name: "OUTLAW CHRONO WATCH",
    price: 2499,
    category: "Watches",
    images: [
      "/images/chrono_watch.png"
    ],
    description: "Signature all-black matte finish chronograph watch. Water-resistant with high-precision quartz movement and calendar function.",
    sizes: ["OS"],
    colors: ["Matte Black"],
    isNew: true
  },
  {
    id: "4",
    name: "OUTLAW CAP",
    price: 699,
    category: "Accessories",
    images: [
      "/images/baseball_cap.png"
    ],
    description: "Classic 6-panel adjustable cotton cap featuring custom Outlaw front embroidery and steel buckle adjustment.",
    sizes: ["OS"],
    colors: ["Black"],
    isNew: false
  },
  {
    id: "5",
    name: "GRAPHIC OVERSIZED TEE",
    price: 1299,
    category: "Clothes",
    images: [
      "/images/graphic_tee.png"
    ],
    description: "Heavyweight drop-shoulder graphic t-shirt with premium front chest typography. Distressed details for a vintage feel.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Washed Black"],
    isNew: true
  },
  {
    id: "6",
    name: "CUBAN CHAIN SILVER",
    price: 1199,
    category: "Accessories",
    images: [
      "/images/cuban_chain.png"
    ],
    description: "Vibrant high-polished silver cuban link chain necklace. Hypoallergenic design with durable secure-lock clasp.",
    sizes: ["18\"", "20\"", "22\""],
    colors: ["Silver"],
    isNew: true
  },
  {
    id: "7",
    name: "CLASSIC GOLDEN CHRONOGRAPH",
    price: 3499,
    category: "Watches",
    images: [
      "/images/chrono_watch.png"
    ],
    description: "Premium gold-accented chronograph watch. Featuring a genuine leather strap and dark brushed metallic dial face.",
    sizes: ["OS"],
    colors: ["Gold/Black"],
    isNew: false
  },
  {
    id: "8",
    name: "STREETWEAR SNEAKERS",
    price: 5999,
    category: "Shoes",
    images: [
      "/images/nike_air_force.png"
    ],
    description: "Minimalist streetwear sneakers built with vulcanized rubber soles and supportive cushioning for all-day comfort.",
    sizes: ["8", "9", "10", "11"],
    colors: ["White/Black"],
    isNew: false
  },
  {
    id: "9",
    name: "DISTRESSED STREETWEAR JOGGER",
    price: 2499,
    category: "Clothes",
    images: [
      "/images/black_hoodie.png"
    ],
    description: "Comfortable heavyweight fleece joggers with raw-edge distressed details and metal-tipped drawstring cords.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Charcoal Black"],
    isNew: false
  },
  {
    id: "10",
    name: "OUTLAW KNIT BEANIE",
    price: 899,
    category: "Accessories",
    images: [
      "/images/baseball_cap.png"
    ],
    description: "Soft-knit ribbed beanie featuring an Outlaw woven styling patch. Keeps you warm and stylish all winter.",
    sizes: ["OS"],
    colors: ["Black"],
    isNew: false
  },
  {
    id: "11",
    name: "RETRO DIVE WATCH",
    price: 1999,
    category: "Watches",
    images: [
      "/images/chrono_watch.png"
    ],
    description: "Vintage-inspired sport dive watch. Built with rotating bezel and luminous hands for visibility in low light.",
    sizes: ["OS"],
    colors: ["Deep Sea Black"],
    isNew: false
  },
  {
    id: "12",
    name: "OUTLAW DUFFLE BAG",
    price: 3199,
    category: "Accessories",
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
    id: "c1",
    name: "Watches",
    image: "/images/chrono_watch.png",
    description: "Legendary precision timepieces."
  },
  {
    id: "c2",
    name: "Shoes",
    image: "/images/nike_air_force.png",
    description: "Footwear built for performance and style."
  },
  {
    id: "c3",
    name: "Clothes",
    image: "/images/black_hoodie.png",
    description: "Premium streetwear essential apparel."
  },
  {
    id: "c4",
    name: "Accessories",
    image: "/images/baseball_cap.png",
    description: "Finish your look with outlaw styling."
  }
];

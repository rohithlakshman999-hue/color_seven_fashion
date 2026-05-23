"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Flame, ShieldCheck, Zap, Award, Truck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import { useHomepageContent } from "@/context/HomepageContentContext";
import { useProducts } from "@/context/ProductContext";

export default function Home() {
  const { getSection, loaded: contentLoaded } = useHomepageContent();
  const { products: dynamicProducts } = useProducts();
  
  // Grab the 6 key trending products from dynamic products
  const trendingProducts = dynamicProducts.filter(p => p.isTrending).length > 0
    ? dynamicProducts.filter(p => p.isTrending).slice(0, 6)
    : dynamicProducts.slice(0, 6);

  // Fetch homepage content from Supabase
  const heroContent = getSection("hero") as {
    left_image?: string;
    right_image?: string;
    title?: string;
    subtitle?: string;
  } || {};
  const categoriesContent = getSection("categories") as {
    enabled?: boolean;
    title?: string;
  } || {};
  const trendingContent = getSection("trending") as {
    enabled?: boolean;
    title?: string;
  } || {};
  const brandPillarsContent = getSection("brand_pillars") as {
    enabled?: boolean;
  } || {};

  // Use Supabase content if available, otherwise use defaults
  const leftHeroImage = heroContent.left_image || "/images/0816a53b-7f43-45cb-a73e-7d2bd6ef8278.jpg";
  const rightHeroImage = heroContent.right_image || "/images/0a479a6e-62c8-434f-9312-7d03855c149b.jpg";
  const heroTitle = heroContent.title || "LEGENDS. STYLE. YOU.";
  const heroSubtitle = heroContent.subtitle || "CLOTHES | SHOES | ACCESSORIES | WATCHES";
  const categoriesTitle = categoriesContent.title || "EXPLORE CATEGORIES";
  const trendingTitle = trendingContent.title || "TRENDING NOW";

  // Split title into parts (e.g. "LEGENDS. STYLE. YOU." -> ["LEGENDS", "STYLE", "YOU"])
  const titleParts = useMemo(() => {
    return (heroTitle || "")
      .split(/[.\s]+/)
      .map((p) => p.trim().toUpperCase())
      .filter(Boolean);
  }, [heroTitle]);

  const word1 = titleParts[0] || "LEGENDS";
  const word2 = titleParts[1] || "STYLE";
  const word3 = titleParts[2] || "YOU";

  // Define category cards in the exact requested order: Watches, Shoes, Clothes, Accessories
  const categoryCards = [
    {
      name: "Watches",
      subtext: "TIMELESS PRECISION",
      image: "/images/chrono_watch.png",
      href: "/shop?category=Watches",
    },
    {
      name: "Shoes",
      subtext: "FOOTWEAR LEGENDS",
      image: "/images/nike_air_force.png",
      href: "/shop?category=Shoes",
    },
    {
      name: "Clothes",
      subtext: "STREETWEAR APPAREL",
      image: "/images/black_hoodie.png",
      href: "/shop?category=Clothes",
    },
    {
      name: "Accessories",
      subtext: "OUTLAW STYLING",
      image: "/images/baseball_cap.png",
      href: "/shop?category=Accessories",
    },
  ];

  return (
    <div className="w-full bg-black text-white overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] sm:h-[95vh] w-full flex flex-col sm:flex-row items-center justify-between overflow-hidden bg-black px-4 md:px-8 py-12 sm:py-0 border-b border-white/5">
        
        {/* Glow Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-[rgba(207,242,39,0.08)] rounded-full filter blur-[80px] md:blur-[120px] pointer-events-none z-0" />

        {/* LEFT PROFILE: Dhoni Banner */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full sm:w-[30%] h-[300px] sm:h-full flex flex-col justify-end pb-8 sm:pb-16 z-10 order-2 sm:order-1 mt-6 sm:mt-0"
        >
          <div className="absolute inset-0 z-0" style={{ position: "absolute" }}>
            <Image
              src={leftHeroImage}
              alt="MS Dhoni Colour Seven Banner"
              fill
              className="object-cover object-top rounded-2xl sm:rounded-none"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent sm:hidden" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black hidden sm:block" />
          </div>
          
          <div className="relative z-10 px-4 md:px-6">
            <h3 className="font-serif text-2xl md:text-4xl xl:text-5xl text-[var(--accent-1)] tracking-widest skew-x-[-10deg] uppercase drop-shadow-lg">
              DHONI
            </h3>
            <p className="text-[8px] md:text-xs tracking-[0.3em] text-zinc-400 font-extrabold mt-1">
              CALM. FOCUSED. LEGENDARY.
            </p>
          </div>
        </motion.div>

        {/* CENTER COLUMN: Hero Copy & Revolve Circle */}
        <div className="relative w-full sm:w-[40%] h-full flex flex-col items-center justify-center text-center z-20 order-1 sm:order-2 px-2 py-8 sm:py-0">
          
          {/* Circular Glowing SVG Arc revolving in background */}
          <div className="absolute w-[280px] sm:w-[350px] md:w-[480px] h-[280px] sm:h-[350px] md:h-[480px] pointer-events-none z-0">
            <svg className="w-full h-full circle-revolve text-[var(--accent-1)]/10" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4 8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="40 10"
                className="opacity-50"
              />
            </svg>
          </div>

          {/* Heading Text */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center justify-center font-sans tracking-tighter"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-black leading-[0.85] text-white uppercase">
              {word1}.
            </h1>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-black leading-[0.85] text-[var(--accent-1)] my-2 filter drop-shadow-[0_0_15px_rgba(207,242,39,0.3)] uppercase">
              {word2}.
            </h1>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-black leading-[0.85] text-white uppercase">
              {word3}.
            </h1>
          </motion.div>

          {/* List of Main categories */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-[8px] sm:text-[9px] md:text-xs tracking-[0.35em] text-zinc-400 font-black uppercase mt-8"
          >
            {heroSubtitle}
          </motion.p>

          {/* Shop Now Button Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 z-30"
          >
            <Link
              href="/shop"
              className="inline-flex items-center space-x-3 bg-[var(--accent-1)] text-black px-8 py-3.5 uppercase tracking-widest text-xs font-black hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 shadow-[0_10px_30px_rgba(207,242,39,0.25)] rounded-full"
            >
              <span>SHOP NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* RIGHT PROFILE: Ronaldo Banner */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full sm:w-[30%] h-[300px] sm:h-full flex flex-col justify-end pb-8 sm:pb-16 z-10 order-3 flex-grow sm:flex-grow-0"
        >
          <div className="absolute inset-0 z-0" style={{ position: "absolute" }}>
            <Image
              src={rightHeroImage}
              alt="Cristiano Ronaldo Colour Seven Banner"
              fill
              className="object-cover object-top rounded-2xl sm:rounded-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent sm:hidden" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-black hidden sm:block" />
          </div>
          
          <div className="relative z-10 px-4 md:px-6 sm:text-right">
            <h3 className="font-serif text-2xl md:text-4xl xl:text-5xl text-[var(--accent-1)] tracking-widest skew-x-[-10deg] uppercase drop-shadow-lg">
              RONALDO
            </h3>
            <p className="text-[8px] md:text-xs tracking-[0.3em] text-zinc-400 font-extrabold mt-1">
              DISCIPLINE. DRIVE. GREATNESS.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Categories Row (Exact Order: Watches, Shoes, Clothes, Accessories) */}
      {categoriesContent.enabled !== false && (
        <section className="py-20 px-4 md:px-8 bg-black relative border-b border-white/5">
        <div className="container mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-center flex items-center gap-2">
              <Zap className="w-5 h-5 text-[var(--accent-1)]" />
              {categoriesTitle}
            </h2>
            <div className="h-1 w-20 bg-[var(--accent-1)] mt-3 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryCards.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link 
                  href={category.href}
                  className="group relative flex flex-col h-[320px] bg-[#070707] border border-white/5 rounded-2xl overflow-hidden hover:border-[var(--accent-1)] hover:shadow-[0_0_25px_rgba(207,242,39,0.15)] transition-all duration-500 cursor-pointer"
                >
                  {/* Category Image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover opacity-30 group-hover:opacity-60 group-hover:scale-115 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  </div>

                  {/* Category Label */}
                  <div className="relative z-10 mt-auto p-6 flex flex-col">
                    <span className="text-[9px] font-black tracking-widest text-zinc-500 group-hover:text-[var(--accent-1)] transition-colors">
                      {category.subtext}
                    </span>
                    <h3 className="font-serif text-3xl text-white tracking-widest skew-x-[-8deg] uppercase mt-1">
                      {category.name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white mt-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      EXPLORE NOW 
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-1)]" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Trending Now Section */}
      {trendingContent.enabled !== false && (
        <section className="py-24 px-4 md:px-8 bg-zinc-950 relative overflow-hidden">
        
        {/* Glow Blobs */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[rgba(207,242,39,0.03)] rounded-full filter blur-[100px] pointer-events-none" />

        <div className="container mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-12 pb-4 border-b border-white/5"
          >
            <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-[var(--accent-1)] animate-pulse" />
              {trendingTitle}
            </h2>
            <Link 
              href="/shop" 
              className="text-xs font-black tracking-widest text-zinc-400 hover:text-[var(--accent-1)] uppercase transition-colors flex items-center gap-1.5"
            >
              VIEW ALL 
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
          
          {/* Trending Products Grid (6 Items) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Premium Brand Pillars */}
      {brandPillarsContent.enabled !== false && (
        <section className="py-20 px-4 md:px-8 bg-[#030303] border-t border-white/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/5">
            <div className="py-6 md:py-0 flex flex-col items-center">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-[var(--accent-1)] shadow-lg">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-wider mb-2 text-white">PAN INDIA FREE SHIPPING</h4>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-xs px-2">Premium styling delivered directly to your doorstep anywhere in India at zero delivery cost.</p>
            </div>
            <div className="py-6 md:py-0 flex flex-col items-center">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-[var(--accent-1)] shadow-lg">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-wider mb-2 text-white">CASH ON DELIVERY</h4>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-xs px-2">Shop securely with Cash On Delivery options available. Pay only when you inspect the parcel.</p>
            </div>
            <div className="py-6 md:py-0 flex flex-col items-center">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 text-[var(--accent-1)] shadow-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-wider mb-2 text-white">PREMIUM ASSURANCE</h4>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-xs px-2">Authentic export surplus items vetted and curated under strict quality controls for premium style.</p>
            </div>
          </div>
        </div>
      </section>
      )}
    </div>
  );
}

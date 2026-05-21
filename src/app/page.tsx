"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Flame, ShieldCheck, Zap, Award, Truck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductContext";
import Image from "next/image";

export default function Home() {
  const { products } = useProducts();
  // Grab the 6 key trending products as shown in the mockup
  const trendingProducts = products.slice(0, 6);

  // Define category cards in the exact requested order: Watches, Shoes, Clothes, Accessories
  const categoryCards = [
    {
      name: "Watches",
      subtext: "TIMELESS PRECISION",
      image: "/images/chrono_watch.png",
      href: "/shop/watches",
    },
    {
      name: "Shoes",
      subtext: "FOOTWEAR LEGENDS",
      image: "/images/nike_air_force.png",
      href: "/shop/shoes",
    },
    {
      name: "Clothes",
      subtext: "STREETWEAR APPAREL",
      image: "/images/black_hoodie.png",
      href: "/shop/clothes",
    },
    {
      name: "Accessories",
      subtext: "OUTLAW STYLING",
      image: "/images/baseball_cap.png",
      href: "/shop/accessories",
    },
  ];

  return (
    <div className="w-full bg-black text-white overflow-hidden">
      
      {/* Hero Section - Same layout across all screen sizes */}
      <section className="relative w-full overflow-hidden bg-black border-b border-white/5">
        
        {/* Glow Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[350px] md:w-[500px] lg:w-[600px] h-[250px] sm:h-[350px] md:h-[500px] lg:h-[600px] bg-[rgba(207,242,39,0.08)] rounded-full filter blur-[60px] md:blur-[80px] lg:blur-[120px] pointer-events-none z-0" />

        {/* UNIFIED LAYOUT - 3 columns side by side on all screen sizes */}
        <div className="flex relative h-[80vh] sm:h-[85vh] md:h-[90vh] lg:h-[95vh] w-full items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 gap-1 sm:gap-2 md:gap-4 lg:gap-6 overflow-hidden">
          
          {/* LEFT: Dhoni */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex-shrink-0 w-[28%] sm:w-[25%] md:w-[22%] lg:w-[25%] h-full flex flex-col justify-end pb-4 sm:pb-6 md:pb-12 lg:pb-16 z-10"
          >
            <div className="absolute inset-0 z-0 min-h-[200px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
              <Image
                src="/images/dhoni_hero.jpg"
                alt="MS Dhoni Banner"
                fill
                className="object-cover object-top opacity-50 grayscale hover:grayscale-0 hover:opacity-75 transition-all duration-700"
                priority
                sizes="(max-width: 640px) 28vw, (max-width: 768px) 25vw, (max-width: 1024px) 22vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black" />
            </div>
            <div className="relative z-10 px-1 sm:px-2 md:px-3 lg:px-6">
              <h3 className="font-serif text-[10px] sm:text-sm md:text-2xl lg:text-4xl xl:text-5xl text-[var(--accent-1)] tracking-widest skew-x-[-10deg] uppercase drop-shadow-lg">
                DHONI
              </h3>
              <p className="text-[5px] sm:text-[6px] md:text-[8px] lg:text-xs tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] text-zinc-400 font-extrabold mt-0.5 sm:mt-1">
                CALM. FOCUSED. LEGENDARY.
              </p>
            </div>
          </motion.div>

          {/* CENTER: Hero Copy */}
          <div className="relative flex-1 h-full flex flex-col items-center justify-center text-center z-20 px-1 sm:px-2 md:px-3 lg:px-4">
            <div className="absolute w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] md:w-[180px] md:h-[180px] lg:w-[240px] lg:h-[240px] xl:w-[380px] xl:h-[380px] pointer-events-none z-0">
              <svg className="w-full h-full circle-revolve text-[var(--accent-1)]/10" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="40 10" className="opacity-50" />
              </svg>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center justify-center font-sans tracking-tighter relative z-10"
            >
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-[5.5rem] font-black leading-[0.9] text-white">LEGENDS.</h1>
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-[5.5rem] font-black leading-[0.9] text-[var(--accent-1)] my-0.5 sm:my-1 md:my-2 filter drop-shadow-[0_0_15px_rgba(207,242,39,0.3)]">STYLE.</h1>
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl 2xl:text-[5.5rem] font-black leading-[0.9] text-white">YOU.</h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-2 sm:mt-4 md:mt-6 lg:mt-8 z-30 relative"
            >
              <Link
                href="/shop"
                className="inline-flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 bg-[var(--accent-1)] text-black px-2 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-2.5 lg:py-3.5 uppercase tracking-widest text-[6px] sm:text-[8px] md:text-[9px] lg:text-xs font-black hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 shadow-[0_10px_30px_rgba(207,242,39,0.25)] rounded-full"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-2 sm:w-3 md:w-4 h-2 sm:h-3 md:h-4" />
              </Link>
            </motion.div>
          </div>

          {/* RIGHT: Ronaldo */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex-shrink-0 w-[28%] sm:w-[25%] md:w-[22%] lg:w-[25%] h-full flex flex-col justify-end pb-4 sm:pb-6 md:pb-12 lg:pb-16 z-10"
          >
            <div className="absolute inset-0 z-0 min-h-[200px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
              <Image
                src="/images/ronaldo_hero.jpg"
                alt="Cristiano Ronaldo Banner"
                fill
                className="object-cover object-top opacity-50 grayscale hover:grayscale-0 hover:opacity-75 transition-all duration-700"
                sizes="(max-width: 640px) 28vw, (max-width: 768px) 25vw, (max-width: 1024px) 22vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-black" />
            </div>
            <div className="relative z-10 px-1 sm:px-2 md:px-3 lg:px-6 text-right">
              <h3 className="font-serif text-[10px] sm:text-sm md:text-2xl lg:text-4xl xl:text-5xl text-[var(--accent-1)] tracking-widest skew-x-[-10deg] uppercase drop-shadow-lg">
                RONALDO
              </h3>
              <p className="text-[5px] sm:text-[6px] md:text-[8px] lg:text-xs tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] text-zinc-400 font-extrabold mt-0.5 sm:mt-1">
                DISCIPLINE. DRIVE. GREATNESS.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Row (Exact Order: Watches, Shoes, Clothes, Accessories) */}
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
              EXPLORE CATEGORIES
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

      {/* Trending Now Section */}
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
              TRENDING NOW
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

      {/* Premium Brand Pillars */}
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
    </div>
  );
}

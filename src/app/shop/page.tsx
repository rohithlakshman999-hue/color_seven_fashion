"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Watches",
    slug: "watches",
    tagline: "TIMELESS PRECISION",
    description: "Chronographs, dive watches & signature timepieces built for legends.",
    image: "/images/chrono_watch.png",
    count: 3,
    accent: "#CFF227",
  },
  {
    name: "Shoes",
    slug: "shoes",
    tagline: "FOOTWEAR LEGENDS",
    description: "Premium export-surplus sneakers & streetwear kicks that hit different.",
    image: "/images/nike_air_force.png",
    count: 2,
    accent: "#CFF227",
  },
  {
    name: "Clothes",
    slug: "clothes",
    tagline: "STREETWEAR APPAREL",
    description: "Oversized hoodies, graphic tees & joggers — the uniform of the bold.",
    image: "/images/black_hoodie.png",
    count: 3,
    accent: "#CFF227",
  },
  {
    name: "Accessories",
    slug: "accessories",
    tagline: "OUTLAW STYLING",
    description: "Caps, chains, bags & essentials to complete the Colour Seven look.",
    image: "/images/baseball_cap.png",
    count: 4,
    accent: "#CFF227",
  },
];

export default function Shop() {
  return (
    <div className="min-h-screen bg-black text-white pt-16 pb-24">

      {/* ── Hero Section - Matching Second Image Design ── */}
      <div className="relative min-h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden px-4 md:px-8">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[rgba(201,162,39,0.08)] rounded-full filter blur-[120px]" />
          <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-5xl">
          {/* Top tagline */}
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-sm md:text-base tracking-[0.3em] uppercase font-black text-[#c9a227] mb-8"
          >
            OUR NEW
          </motion.p>

          {/* Main heading with outline style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl uppercase tracking-tight text-white mb-6 drop-shadow-2xl leading-tight">
              COLLECTION
            </h1>
          </motion.div>

          {/* Secondary tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-2xl uppercase tracking-widest text-white font-light mb-12 leading-relaxed"
          >
            REDEFINE YOUR STYLE
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link
              href="#categories"
              className="inline-flex items-center gap-3 px-8 md:px-12 py-4 md:py-5 border-2 border-[#c9a227] text-[#c9a227] uppercase font-black tracking-widest text-sm md:text-base hover:bg-[#c9a227] hover:text-black transition-all duration-300 group"
            >
              EXPLORE COLLECTION
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Categories Section ── */}
      <div id="categories" className="relative py-16 md:py-24 mb-8">
        <div className="absolute inset-0 pointer-events-none border-t border-b border-white/5" />
      </div>

      {/* ── Category Grid ── */}
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.6, ease: "easeOut" }}
            >
              <Link href={`/shop/${cat.slug}`} className="group block relative rounded-2xl overflow-hidden bg-[#070707] border border-white/5 hover:border-[#c9a227]/40 transition-all duration-500 shadow-xl hover:shadow-[0_0_40px_rgba(201,162,39,0.12)]">
                {/* Product image background */}
                <div className="relative h-72 md:h-80 lg:h-96 overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  {/* Product count badge */}
                  <div className="absolute top-5 right-5 bg-black/60 border border-white/10 backdrop-blur-sm text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full">
                    {cat.count} Items
                  </div>
                </div>

                {/* Text content */}
                <div className="p-7 border-t border-white/5 group-hover:border-[#c9a227]/20 transition-colors duration-300 bg-gradient-to-b from-[#0a0a0a] to-black">
                  <p className="text-[#c9a227] text-[9px] tracking-[0.4em] uppercase font-black mb-2">
                    {cat.tagline}
                  </p>
                  <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-wider text-white skew-x-[-6deg] mb-3 group-hover:text-[#c9a227] transition-colors duration-300">
                    {cat.name}
                  </h2>
                  <p className="text-zinc-500 text-xs leading-relaxed mb-6 font-medium">
                    {cat.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#c9a227] group-hover:gap-4 transition-all duration-300">
                      EXPLORE COLLECTION
                      <ArrowRight className="w-4 h-4" />
                    </span>
                    <div className="w-8 h-8 rounded-full border border-[#c9a227]/30 flex items-center justify-center group-hover:bg-[#c9a227] group-hover:border-[#c9a227] transition-all duration-300">
                      <ArrowRight className="w-3.5 h-3.5 text-[#c9a227] group-hover:text-black transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

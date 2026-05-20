"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { ArrowLeft, Gem } from "lucide-react";

export default function AccessoriesPage() {
  const catProducts = products.filter((p) => p.category === "Accessories");

  return (
    <div className="min-h-screen bg-black text-white pt-16 pb-24">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden mb-12">
        <Image
          src="/images/baseball_cap.png"
          alt="Accessories"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gem className="w-5 h-5 text-[#CFF227]" />
              <p className="text-[#CFF227] text-[10px] tracking-[0.5em] uppercase font-black">COLOUR SEVEN FASHION</p>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl uppercase tracking-widest skew-x-[-6deg]">ACCESSORIES</h1>
            <div className="h-[2px] w-16 bg-[#CFF227] mx-auto mt-4 rounded-full" />
            <p className="text-zinc-500 text-xs tracking-[0.25em] uppercase font-bold mt-4">OUTLAW STYLING — {catProducts.length} ITEMS</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <Link href="/shop" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#CFF227] transition-colors mb-10 group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {catProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

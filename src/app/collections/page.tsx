"use client";

import { collections } from "@/data/products";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Collections() {
  return (
    <div className="pt-16 pb-24 bg-black min-h-screen text-white">
      {/* Header Banner */}
      <div className="bg-[#030303] border-b border-white/5 py-16 mb-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-[rgba(207,242,39,0.03)] rounded-full filter blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-widest uppercase mb-4 flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-[var(--accent-1)]" />
            CURATED COLLECTIONS
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm tracking-[0.25em] uppercase font-bold">
            OUTLAW STYLING STORE &bull; EXCLUSIVE EDITS
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex flex-col space-y-16 md:space-y-28">
          {collections.map((collection, index) => (
            <motion.div 
              key={collection.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-center ${
                index % 2 !== 0 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Collection Image */}
              <div className="w-full lg:w-3/5 aspect-[4/3] relative overflow-hidden bg-zinc-950 group rounded-2xl border border-white/10 shadow-2xl">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>

              {/* Collection Details */}
              <div className="w-full lg:w-2/5 flex flex-col justify-center text-center lg:text-left px-4">
                <span className="text-[var(--accent-1)] uppercase tracking-[0.25em] text-[10px] font-black mb-3">
                  COLLECTION #0{index + 1}
                </span>
                <h2 className="font-serif text-4xl text-white mb-6 uppercase tracking-wider skew-x-[-8deg]">
                  {collection.name}
                </h2>
                <p className="text-zinc-400 font-medium leading-relaxed mb-8 text-xs md:text-sm">
                  {collection.description} Redefining the standard of premium styling through our curated {collection.name.toLowerCase()} capsule. Tailored for individuals who make their own rules.
                </p>
                <Link
                  href={`/shop?category=${collection.name}`}
                  className="inline-flex items-center space-x-3 text-black bg-[var(--accent-1)] hover:bg-white hover:text-black transition-all px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg mx-auto lg:mx-0 w-fit"
                >
                  <span>Explore Edit</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

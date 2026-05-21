"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand?: string;
    price: number;
    images: string[];
    category: string;
    isNew?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group flex flex-col bg-[#070707] border border-white/5 p-3 rounded-xl transition-all duration-300 hover:border-[var(--accent-1)] hover:shadow-[0_0_20px_rgba(207,242,39,0.15)] relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[1/1] overflow-hidden bg-zinc-950 mb-3.5 rounded-lg border border-white/5">
        {product.isNew && (
          <span className="absolute top-3 left-3 z-10 bg-[var(--accent-1)] text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-lg">
            NEW
          </span>
        )}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all shadow-xl bg-black/40 backdrop-blur-md border border-white/5 ${
            isWishlisted ? "text-[var(--accent-1)] bg-black/60" : "text-white/60 hover:text-white"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`} />
        </motion.button>
        
        <Link href={`/shop/${product.id}`} className="absolute inset-0 block">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            priority={product.id === "1" || product.id === "2" || product.id === "3"}
          />
        </Link>

        {/* Quick Add Button overlay */}
        <div className="absolute bottom-0 left-0 w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-[var(--accent-1)] text-black py-2.5 text-xs font-black uppercase tracking-widest shadow-lg flex items-center justify-center space-x-2 rounded-lg transition-all duration-300 hover:bg-white hover:text-black"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>ADD TO CART</span>
          </motion.button>
        </div>
      </div>

      <div className="px-1 flex flex-col flex-grow">
        <Link href={`/shop/${product.id}`} className="flex-grow">
          {product.brand && (
            <span className="text-[9px] text-[var(--accent-1)] tracking-widest font-bold uppercase mb-0.5 block">
              {product.brand}
            </span>
          )}
          <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider mb-1.5 group-hover:text-[var(--accent-1)] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-auto">
          <p className="text-xs md:text-sm text-[var(--accent-1)] font-black">₹{product.price.toLocaleString()}</p>
          <span className="text-[9px] text-zinc-500 tracking-widest font-semibold uppercase">{product.category}</span>
        </div>
      </div>
    </motion.div>
  );
}

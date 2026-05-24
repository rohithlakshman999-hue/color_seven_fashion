"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: string;
    slug?: string;
    name: string;
    brand?: string;
    price: number;
    images: string[];
    category: string;
    isNew?: boolean;
  };
}

function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div
      className="group flex flex-col bg-[#070707] border border-white/5 p-3 rounded-xl transition-colors duration-200 hover:border-[var(--accent-1)] hover:shadow-[0_0_20px_rgba(207,242,39,0.15)] relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-950 mb-3.5 rounded-lg border border-white/5" style={{ position: "relative" }}>
        {product.isNew && (
          <span className="absolute top-3 left-3 z-10 bg-[var(--accent-1)] text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-lg">
            NEW
          </span>
        )}
        <Link href={`/products/${product.slug || product.id}`} className="relative block w-full h-full">
          <Image
            src={product.images[0] || "/images/chrono_watch.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover transition-transform duration-300 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
            loading="lazy"
          />
        </Link>
        <div
          className={`absolute bottom-3 right-3 flex gap-2 transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="p-2 bg-black/80 rounded-full text-white hover:text-red-400 transition-colors"
            aria-label="Wishlist"
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-red-400 text-red-400" : ""}`}
            />
          </button>
          <Link
            href={`/products/${product.slug || product.id}`}
            className="p-2 bg-[var(--accent-1)] rounded-full text-black hover:brightness-110 transition-all"
            aria-label="View product"
          >
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Link href={`/products/${product.slug || product.id}`} className="flex flex-col flex-1">
        {product.brand && (
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">
            {product.brand}
          </span>
        )}
        <h3 className="text-sm font-bold text-white uppercase tracking-wide line-clamp-2 group-hover:text-[var(--accent-1)] transition-colors">
          {product.name}
        </h3>
        <p className="text-[var(--accent-1)] font-black text-sm mt-2">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
      </Link>
    </div>
  );
}

export default memo(ProductCard);

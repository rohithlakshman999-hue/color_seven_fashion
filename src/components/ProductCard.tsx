"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Check } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import ProductPriceDisplay from "@/components/ProductPriceDisplay";
import { calculateDiscount } from "@/lib/pricing";

interface ProductCardProps {
  product: {
    id: string;
    slug?: string;
    name: string;
    brand?: string;
    price: number;
    originalPrice?: number;
    discountPrice?: number;
    discountPercentage?: number;
    images: string[];
    category: string;
    isNew?: boolean;
  };
}

function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addToCart } = useCart();

  const discount = calculateDiscount(
    product.originalPrice ?? product.price,
    product.discountPrice ?? (product.originalPrice ? product.price : undefined)
  );

  const handleQuickAdd = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0] || "/images/chrono_watch.png",
      quantity: 1,
      slug: product.slug,
      openDrawer: true,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

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
        {discount.hasDiscount && (
          <span className="absolute top-3 right-3 z-10 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-lg">
            {discount.discountPercentage}% OFF
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className="p-2 bg-black/80 rounded-full text-white hover:text-red-400 transition-colors"
            aria-label="Wishlist"
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-red-400 text-red-400" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleQuickAdd();
            }}
            className={`p-2 rounded-full transition-all ${
              justAdded
                ? "bg-emerald-400 text-black scale-110 shadow-[0_0_15px_rgba(52,211,153,0.6)]"
                : "bg-[var(--accent-1)] text-black hover:brightness-110 hover:scale-105"
            }`}
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
          >
            {justAdded ? (
              <Check className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
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
        <div className="mt-2.5">
          <ProductPriceDisplay
            originalPrice={product.originalPrice}
            price={product.price}
            discountPrice={product.discountPrice}
            discountPercentage={product.discountPercentage}
            size="md"
            layout="vertical"
          />
        </div>
      </Link>
    </div>
  );
}

export default memo(ProductCard);

"use client";

import { useState, use } from "react";
import { useProducts } from "@/context/ProductContext";
import { Heart, ShoppingBag, ArrowLeft, Plus, Minus, ShieldCheck, RefreshCw, Truck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { getProductById } = useProducts();
  const product = getProductById(resolvedParams.id);
  
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return <div className="pt-32 text-center h-screen bg-black text-[var(--accent-1)] font-black uppercase tracking-widest">Product not found</div>;

  return (
    <div className="pt-16 pb-24 bg-black min-h-screen text-white">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-8 flex items-center text-xs text-zinc-500 uppercase tracking-widest">
          <Link href="/shop" className="hover:text-[var(--accent-1)] transition-luxury flex items-center space-x-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-bold">BACK TO SHOP</span>
          </Link>
          <span className="mx-3 text-zinc-700">/</span>
          <span className="text-zinc-400 font-bold">{product.category}</span>
          <span className="mx-3 text-zinc-700">/</span>
          <span className="text-zinc-300 font-bold line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* LEFT COLUMN: Gallery & Hero Image */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            
            {/* Thumbnails list */}
            {product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-20 shrink-0 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-16 md:w-full aspect-[1/1] bg-zinc-950 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-[var(--accent-1)]' : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} thumbnail ${idx}`} 
                      className="object-cover w-full h-full opacity-80 hover:opacity-100" 
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Active Image Box */}
            <div className="flex-1 relative aspect-[1/1] bg-zinc-950 overflow-hidden border border-white/10 rounded-2xl group">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                src={product.images[activeImage]} 
                alt={product.name} 
                className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-115"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Product Metadata & Controls */}
          <div className="flex flex-col py-2 justify-center">
            
            {/* Tag / Badge */}
            {product.isNew && (
              <span className="inline-block bg-[var(--accent-1)] text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-lg w-max mb-4">
                NEW RELEASE
              </span>
            )}

            {product.brand && (
              <span className="text-xs text-[var(--accent-1)] tracking-[0.2em] font-black uppercase mb-1.5 block">
                {product.brand}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider mb-2 leading-tight">
              {product.name}
            </h1>
            <span className="text-[10px] text-zinc-500 tracking-widest font-black uppercase mb-6 block">
              {product.category}
            </span>
            
            <p className="text-2xl md:text-3xl text-[var(--accent-1)] mb-8 font-black">
              ₹{product.price.toLocaleString()}
            </p>
            
            <p className="text-zinc-400 leading-relaxed mb-10 font-medium text-xs md:text-sm">
              {product.description}
            </p>

            {/* Colors Options */}
            {product.colors.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between mb-3.5 text-xs tracking-widest uppercase text-zinc-500 font-black">
                  <span>Color</span>
                  <span className="text-white">{selectedColor || 'Select Option'}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                        selectedColor === color 
                          ? 'border-[var(--accent-1)] bg-[var(--accent-1)] text-black font-extrabold shadow-lg shadow-[rgba(207,242,39,0.15)]' 
                          : 'border-white/10 hover:border-white/30 text-zinc-400 hover:text-white bg-[#070707]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Options */}
            {product.sizes.length > 0 && product.sizes[0] !== "OS" && (
              <div className="mb-10">
                <div className="flex justify-between mb-3.5 text-xs tracking-widest uppercase text-zinc-500 font-black">
                  <span>Select Size</span>
                  <span className="text-white">{selectedSize || 'Select Option'}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 border flex items-center justify-center text-xs font-black rounded-lg transition-all ${
                        selectedSize === size 
                          ? 'border-[var(--accent-1)] bg-[var(--accent-1)] text-black font-extrabold shadow-lg shadow-[rgba(207,242,39,0.15)]' 
                          : 'border-white/10 hover:border-white/30 text-zinc-400 hover:text-white bg-[#070707]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector and Wishlist Row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              
              {/* Quantity Selector */}
              <div className="flex items-center border border-white/10 bg-[#070707] w-full sm:w-32 h-12 justify-between px-4 rounded-xl">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-black tracking-wider text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {/* Wishlist Button */}
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`flex-1 w-12 h-12 border flex items-center justify-center rounded-xl transition-all ${
                  isWishlisted 
                    ? 'border-[var(--accent-1)] bg-[var(--accent-1)]/10 text-[var(--accent-1)]' 
                    : 'border-white/10 text-zinc-400 hover:text-white hover:border-white/30 bg-[#070707]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Quick Guarantees list */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8 mt-4 text-[10px] md:text-xs font-bold text-zinc-400 tracking-wider">
              <div className="flex flex-col items-center text-center p-3 bg-[#070707] border border-white/5 rounded-xl">
                <Truck className="w-4 h-4 text-[var(--accent-1)] mb-2" />
                <span>FREE DELIVERY</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-[#070707] border border-white/5 rounded-xl">
                <RefreshCw className="w-4 h-4 text-[var(--accent-1)] mb-2" />
                <span>7 DAYS RETURN</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-[#070707] border border-white/5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-[var(--accent-1)] mb-2" />
                <span>SECURE CHECKOUT</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  MessageCircle,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useCart, CartItem } from "@/context/CartContext";
import { useContactInfo } from "@/context/ContactInfoContext";

export default function CartDrawer() {
  const {
    items,
    totalCount,
    subtotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { contactInfo } = useContactInfo();
  const drawerRef = useRef<HTMLDivElement>(null);

  const fallbackWhatsapp = "8122228386";
  const whatsappNumber = (contactInfo?.whatsapp_number || fallbackWhatsapp).replace(
    /\D/g,
    ""
  );

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock background scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const generateWhatsAppOrderUrl = () => {
    if (items.length === 0) return "#";

    let message = "🛍️ *NEW ORDER FROM COLOUR SEVEN CART*\n";
    message += "══════════════════════════════\n\n";

    items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      message += `*${index + 1}. ${item.name}*\n`;
      if (item.brand) message += `   • Brand: ${item.brand}\n`;
      if (item.size) message += `   • Size: ${item.size}\n`;
      if (item.color) message += `   • Color: ${item.color}\n`;
      message += `   • Quantity: ${item.quantity}\n`;
      message += `   • Price: Rs. ${item.price.toLocaleString("en-IN")} each\n`;
      message += `   • Subtotal: Rs. ${itemTotal.toLocaleString("en-IN")}\n`;
      if (item.image) {
        let fullImageUrl = item.image;
        if (!fullImageUrl.startsWith("http") && typeof window !== "undefined") {
          fullImageUrl = `${window.location.origin}${
            fullImageUrl.startsWith("/") ? "" : "/"
          }${fullImageUrl}`;
        }
        message += `   • Image: ${fullImageUrl}\n`;
      }
      message += "\n";
    });

    message += "══════════════════════════════\n";
    message += `*Total Items:* ${totalCount}\n`;
    message += `*Total Amount:* Rs. ${subtotal.toLocaleString("en-IN")}\n`;
    message += "══════════════════════════════\n\n";
    message += "Please confirm my order and share payment and shipping details!";

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#070707] text-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <ShoppingBag className="h-5 w-5 text-[var(--accent-1)]" />
                  {totalCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-1)] text-[10px] font-black text-black">
                      {totalCount}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-wider text-white">
                    Shopping Bag
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    {totalCount} {totalCount === 1 ? "item" : "items"} selected
                  </p>
                </div>
              </div>

              <button
                onClick={closeCart}
                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close cart drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Perks announcement */}
            <div className="flex items-center justify-center gap-2 border-b border-white/5 bg-zinc-950/80 px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-[#c9a227]">
              <Truck className="h-3.5 w-3.5" />
              <span>Fast All-India Shipping & Authenticity Guaranteed</span>
            </div>

            {/* Cart Items List or Empty State */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
                  <ShoppingBag className="h-10 w-10 text-zinc-600" />
                </div>
                <h3 className="mb-2 text-lg font-black uppercase tracking-wider text-white">
                  Your Bag Is Empty
                </h3>
                <p className="mb-8 max-w-xs text-xs text-zinc-400 leading-relaxed">
                  You haven&apos;t added any luxury streetwear, watches, or accessories to your cart yet.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="flex items-center gap-2 rounded-full bg-[var(--accent-1)] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(207,242,39,0.25)] transition-all hover:bg-white hover:scale-105"
                >
                  Explore Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-white/5">
                {items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-2 last:pb-2">
                    <div className="flex gap-4">
                      {/* Item Thumbnail */}
                      <Link
                        href={item.slug ? `/products/${item.slug}` : `/products/${item.productId}`}
                        onClick={closeCart}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-950"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-700">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </Link>

                      {/* Item Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              {item.brand && (
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#c9a227]">
                                  {item.brand}
                                </p>
                              )}
                              <Link
                                href={item.slug ? `/products/${item.slug}` : `/products/${item.productId}`}
                                onClick={closeCart}
                                className="line-clamp-1 text-xs font-black uppercase tracking-wider text-white hover:text-[var(--accent-1)] transition-colors"
                              >
                                {item.name}
                              </Link>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Variant Pills (Size & Color) */}
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {item.size && (
                              <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Quantity Controls */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-black text-[var(--accent-1)]">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-zinc-500">
                                (₹{item.price.toLocaleString("en-IN")} ea)
                              </span>
                            )}
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors rounded-l"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors rounded-r"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Summary & Checkout CTAs */}
            {items.length > 0 && (
              <div className="border-t border-white/10 bg-[#050505] p-6 space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-bold text-white">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Delivery</span>
                    <span className="font-bold text-[#c9a227]">FREE</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-black text-white">
                    <span>Total Amount</span>
                    <span className="text-base text-[var(--accent-1)]">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Primary: WhatsApp Order */}
                <a
                  href={generateWhatsAppOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-xs font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(37,211,102,0.25)] transition-all hover:brightness-110 active:scale-[0.99]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Order via WhatsApp
                </a>

                {/* Secondary: Full Cart Page */}
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
                >
                  View Full Bag & Checkout Details
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={clearCart}
                    className="text-[11px] font-semibold text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Clear Bag
                  </button>
                  <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <ShieldCheck className="h-3 w-3 text-[var(--accent-1)]" />
                    Verified Checkout
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

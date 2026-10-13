"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Truck,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useContactInfo } from "@/context/ContactInfoContext";

export default function CartPage() {
  const {
    items,
    totalCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { contactInfo } = useContactInfo();

  // Customer shipping information for quick order
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerPincode, setCustomerPincode] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const fallbackWhatsapp = "8122228386";
  const whatsappNumber = (contactInfo?.whatsapp_number || fallbackWhatsapp).replace(
    /\D/g,
    ""
  );

  const generateWhatsAppCheckoutUrl = () => {
    let message = "🛍️ *NEW ORDER FROM COLOUR SEVEN CART*\n";
    message += "═══════════════════════════════════\n\n";

    items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      message += `*${index + 1}. ${item.name}*\n`;
      if (item.brand) message += `   • Brand: ${item.brand}\n`;
      if (item.size) message += `   • Size: ${item.size}\n`;
      if (item.color) message += `   • Color: ${item.color}\n`;
      message += `   • Quantity: ${item.quantity}\n`;
      message += `   • Price: Rs. ${item.price.toLocaleString("en-IN")}\n`;
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

    message += "═══════════════════════════════════\n";
    message += `*Total Items:* ${totalCount}\n`;
    message += `*Total Order Amount:* Rs. ${subtotal.toLocaleString("en-IN")}\n`;
    message += "═══════════════════════════════════\n\n";

    // Append customer delivery details if filled out
    if (customerName || customerAddress || customerPhone) {
      message += "*CUSTOMER DELIVERY DETAILS:*\n";
      if (customerName) message += `• Name: ${customerName}\n`;
      if (customerPhone) message += `• Phone: ${customerPhone}\n`;
      if (customerAddress) message += `• Address: ${customerAddress}\n`;
      if (customerCity || customerPincode) {
        message += `• City / PIN: ${customerCity} - ${customerPincode}\n`;
      }
      if (orderNotes) message += `• Notes: ${orderNotes}\n`;
      message += "\n";
    }

    message += "Please confirm my order and share payment details. Thank you!";

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-black pb-24 pt-24 text-white">
      <div className="container mx-auto px-4 md:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-8 flex items-center text-xs uppercase tracking-widest text-zinc-500">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="mx-3">/</span>
          <Link href="/shop" className="hover:text-white transition-colors">
            Shop
          </Link>
          <span className="mx-3">/</span>
          <span className="text-[var(--accent-1)] font-bold">Shopping Bag</span>
        </div>

        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-white">
              Shopping Bag
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {totalCount > 0
                ? `You have ${totalCount} ${
                    totalCount === 1 ? "item" : "items"
                  } in your cart`
                : "Your bag is currently empty"}
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-red-400 transition-colors self-start sm:self-auto"
            >
              Clear Entire Bag
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Bag State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#070707] py-20 px-4 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
              <ShoppingBag className="h-12 w-12 text-zinc-600" />
            </div>
            <h2 className="mb-3 text-2xl font-black uppercase tracking-wider text-white">
              Your Bag is Empty
            </h2>
            <p className="mb-8 max-w-md text-sm text-zinc-400 leading-relaxed">
              Looks like you haven&apos;t added any items yet. Explore our luxury streetwear drops, signature watches, sneakers, and accessories.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 rounded-full bg-[var(--accent-1)] px-8 py-4 text-xs font-black uppercase tracking-widest text-black shadow-[0_10px_30px_rgba(207,242,39,0.25)] transition-all hover:bg-white hover:scale-105"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* Cart Content Layout */
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left 7 cols: Items Table / List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#070707] p-4 md:p-6 divide-y divide-white/5">
                {items.map((item) => (
                  <div key={item.id} className="py-6 first:pt-2 last:pb-2">
                    <div className="flex flex-col sm:flex-row gap-5">
                      {/* Thumbnail */}
                      <Link
                        href={
                          item.slug
                            ? `/products/${item.slug}`
                            : `/products/${item.productId}`
                        }
                        className="relative aspect-square h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 mx-auto sm:mx-0"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-700">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                        )}
                      </Link>

                      {/* Info & Quantity */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              {item.brand && (
                                <p className="text-[11px] font-black uppercase tracking-widest text-[#c9a227]">
                                  {item.brand}
                                </p>
                              )}
                              <Link
                                href={
                                  item.slug
                                    ? `/products/${item.slug}`
                                    : `/products/${item.productId}`
                                }
                                className="text-base font-black uppercase tracking-wider text-white hover:text-[var(--accent-1)] transition-colors"
                              >
                                {item.name}
                              </Link>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          {/* Variants */}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.size && (
                              <span className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-zinc-300">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-zinc-300">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Stepper */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5">
                          <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="flex h-8 w-8 items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors rounded-l"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-10 text-center text-xs font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="flex h-8 w-8 items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors rounded-r"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-black text-[var(--accent-1)]">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                            {item.quantity > 1 && (
                              <p className="text-[10px] text-zinc-500">
                                ₹{item.price.toLocaleString("en-IN")} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right 5 cols: Order Summary & Checkout Form */}
            <div className="lg:col-span-5 space-y-6">
              {/* Order Summary Card */}
              <div className="rounded-2xl border border-white/10 bg-[#070707] p-6 space-y-6">
                <h2 className="text-lg font-black uppercase tracking-wider text-white">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs border-b border-white/10 pb-4">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal ({totalCount} items)</span>
                    <span className="font-bold text-white">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Pan-India Delivery</span>
                    <span className="font-bold text-[#c9a227]">FREE</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Estimated Tax</span>
                    <span className="font-bold text-zinc-400">Included</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-black text-white">
                  <span>Grand Total</span>
                  <span className="text-xl text-[var(--accent-1)]">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Shipping Details Input (Optional for faster checkout) */}
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#c9a227]">
                    Optional: Your Shipping Details
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-[#c9a227] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number (e.g. 9876543210)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-[#c9a227] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Delivery Address (Street / Flat)"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-[#c9a227] focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-[#c9a227] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={customerPincode}
                        onChange={(e) => setCustomerPincode(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-[#c9a227] focus:outline-none"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Special instructions or notes (optional)"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#c9a227] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Primary WhatsApp Order Button */}
                <a
                  href={generateWhatsAppCheckoutUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] py-4 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_25px_rgba(37,211,102,0.3)] transition-all hover:brightness-110 active:scale-[0.99]"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Place Order via WhatsApp</span>
                </a>

                <div className="space-y-2 pt-2 text-[11px] text-zinc-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent-1)]" />
                    <span>Instant order confirmation directly from our team</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-[var(--accent-1)]" />
                    <span>Fast tracked dispatch all across India</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent-1)]" />
                    <span>Safe UPI, Bank Transfer or COD available on confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

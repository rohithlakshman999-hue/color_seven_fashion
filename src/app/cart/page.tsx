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
  Tag,
  TicketPercent,
  X,
  RefreshCw,
  AlertCircle,
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
    appliedCoupon,
    discountAmount,
    finalTotal,
    couponLoading,
    couponError,
    couponSuccessMessage,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { contactInfo } = useContactInfo();

  // Coupon input state
  const [couponCodeInput, setCouponCodeInput] = useState("");

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

  const handleApplyCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = await applyCoupon(couponCodeInput);
    if (res.success) {
      setCouponCodeInput("");
    }
  };

  const handleCheckoutClick = () => {
    // If a coupon is applied, record redemption in the background
    if (appliedCoupon && items.length > 0) {
      fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: appliedCoupon.code,
          items: items.map((i) => ({
            productId: i.productId,
            price: i.price,
            quantity: i.quantity,
          })),
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
        }),
      }).catch((e) => console.warn("Coupon redemption log error:", e));
    }
  };

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
    message += `*Subtotal:* Rs. ${subtotal.toLocaleString("en-IN")}\n`;

    if (appliedCoupon && discountAmount > 0) {
      message += `*Coupon Discount (${appliedCoupon.code}):* -Rs. ${discountAmount.toLocaleString("en-IN")}\n`;
      message += `*Final Payable Amount:* Rs. ${finalTotal.toLocaleString("en-IN")}\n`;
    } else {
      message += `*Total Order Amount:* Rs. ${subtotal.toLocaleString("en-IN")}\n`;
    }
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
              className="text-xs uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors self-start sm:self-end"
            >
              Clear Entire Bag
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#070707] py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-zinc-600">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-wider text-white">
              Your Bag is Empty
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">
              Explore our luxury streetwear, designer footwear, and precision timepieces.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--accent-1)] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-black hover:brightness-110 transition-all"
            >
              <span>Start Shopping</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 cols: Items List */}
            <div className="lg:col-span-7 space-y-4">
              {items.map((item) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#070707] p-4 sm:p-5 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative h-20 w-20 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0 border border-white/10">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        {item.brand && (
                          <span className="text-[10px] font-black tracking-widest uppercase text-[#c9a227]">
                            {item.brand}
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-white truncate mt-0.5">
                          {item.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 mt-1">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.size && item.color && <span>•</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                        <div className="text-sm font-extrabold text-[var(--accent-1)] mt-1.5">
                          ₹{item.price.toLocaleString("en-IN")} each
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector & Item Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <div className="flex items-center rounded-lg border border-white/10 bg-black">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-white">
                          ₹{itemTotal.toLocaleString("en-IN")}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1 mt-1 ml-auto"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 flex items-center justify-between">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-[var(--accent-1)] uppercase tracking-wider transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right 5 cols: Order Summary, Coupon & Checkout Form */}
            <div className="lg:col-span-5 space-y-6">
              {/* Order Summary Card */}
              <div className="rounded-3xl border border-white/10 bg-[#070707] p-6 space-y-6 shadow-2xl">
                <h2 className="text-lg font-black uppercase tracking-wider text-white">
                  Order Summary
                </h2>

                {/* COUPON SECTION */}
                <div className="rounded-2xl border border-white/10 bg-black p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <TicketPercent className="w-4 h-4 text-[var(--accent-1)]" />
                      <span>Have a Discount Coupon?</span>
                    </span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs text-white uppercase tracking-wider">
                              {appliedCoupon.code}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                              Applied
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-400 mt-0.5">
                            Saving ₹{discountAmount.toLocaleString("en-IN")} on your order
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={removeCoupon}
                        title="Remove coupon"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCouponSubmit} className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value)}
                          placeholder="Enter coupon code (e.g. SAVE1000)"
                          className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[var(--accent-1)] transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={couponLoading || !couponCodeInput.trim()}
                          className="px-5 py-2.5 rounded-xl bg-[var(--accent-1)] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
                        >
                          {couponLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          <span>Apply</span>
                        </button>
                      </div>

                      {couponError && (
                        <div className="text-[11px] text-red-400 flex items-center gap-1.5 pt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{couponError}</span>
                        </div>
                      )}
                      {couponSuccessMessage && (
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{couponSuccessMessage}</span>
                        </div>
                      )}
                    </form>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 text-xs border-b border-white/10 pb-4">
                  <div className="flex justify-between text-zinc-400">
                    <span>Original Price ({totalCount} items)</span>
                    <span className="font-bold text-white">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Coupon Discount ({appliedCoupon.code})</span>
                      </span>
                      <span>−₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

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
                  <span>Final Payable Amount</span>
                  <div className="text-right">
                    {appliedCoupon && discountAmount > 0 && (
                      <span className="block text-xs line-through text-zinc-500 font-normal">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    )}
                    <span className="text-xl text-[var(--accent-1)]">
                      ₹{finalTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Shipping Details Input */}
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
                  onClick={handleCheckoutClick}
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

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Watch,
  Footprints,
  Shirt,
  Gem,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import { useProducts } from "@/context/ProductContext";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Watches: Watch,
  Shoes: Footprints,
  Clothes: Shirt,
  Accessories: Gem,
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function AdminDashboard() {
  const { products } = useProducts();

  const categoryCounts = {
    Watches: products.filter((p) => p.category === "Watches").length,
    Shoes: products.filter((p) => p.category === "Shoes").length,
    Clothes: products.filter((p) => p.category === "Clothes").length,
    Accessories: products.filter((p) => p.category === "Accessories").length,
  };

  const recentProducts = [...products].reverse().slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-serif">
          Dashboard
        </h1>
        <p className="text-zinc-500 mt-1">
          Welcome to the Colour Seven Admin Panel
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Products */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#070707] border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              Total Products
            </span>
            <Package className="w-4 h-4 text-[var(--accent-1)]" />
          </div>
          <p className="text-3xl font-black text-white">{products.length}</p>
        </motion.div>

        {/* Category Cards */}
        {(Object.entries(categoryCounts) as [string, number][]).map(
          ([cat, count], i) => {
            const Icon = categoryIcons[cat] || Package;
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="bg-[#070707] border border-white/5 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                    {cat}
                  </span>
                  <Icon className="w-4 h-4 text-[#c9a227]" />
                </div>
                <p className="text-3xl font-black text-white">{count}</p>
              </motion.div>
            );
          }
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/products/add"
          className="group flex items-center gap-4 p-6 bg-[#070707] border border-white/5 rounded-2xl hover:border-[var(--accent-1)]/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-1)]/10 flex items-center justify-center group-hover:bg-[var(--accent-1)]/20 transition-colors">
            <PlusCircle className="w-5 h-5 text-[var(--accent-1)]" />
          </div>
          <div>
            <h3 className="font-bold text-white">Add Product</h3>
            <p className="text-xs text-zinc-500">Create a new product listing</p>
          </div>
        </Link>
        <Link
          href="/"
          target="_blank"
          className="group flex items-center gap-4 p-6 bg-[#070707] border border-white/5 rounded-2xl hover:border-[#c9a227]/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#c9a227]/10 flex items-center justify-center group-hover:bg-[#c9a227]/20 transition-colors">
            <ExternalLink className="w-5 h-5 text-[#c9a227]" />
          </div>
          <div>
            <h3 className="font-bold text-white">View Store</h3>
            <p className="text-xs text-zinc-500">Open storefront in new tab</p>
          </div>
        </Link>
      </div>

      {/* Recent Products */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-white">Recent Products</h2>
        {recentProducts.length === 0 ? (
          <p className="text-zinc-500 text-sm">No products yet.</p>
        ) : (
          <div className="bg-[#070707] border border-white/5 rounded-2xl overflow-hidden">
            {recentProducts.map((product, i) => (
              <Link
                key={product.id}
                href={`/admin/products/edit/${product.id}`}
                className={`flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors ${
                  i < recentProducts.length - 1
                    ? "border-b border-white/5"
                    : ""
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {product.category} · {product.brand}
                  </p>
                </div>
                <span className="text-sm font-bold text-[var(--accent-1)]">
                  {currency.format(product.price)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Edit2, Trash2, Plus, Package } from "lucide-react";
import { useProducts } from "@/context/ProductContext";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const categories = ["All", "Watches", "Shoes", "Clothing", "Accessories"] as const;

export default function AdminProductsPage() {
  const { products, deleteProduct } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      alert(error?.message || "Failed to delete product");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-serif">
            All Products
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {products.length} products total
          </p>
        </div>
        <Link
          href="/admin/products/add"
          className="flex items-center justify-center gap-2 bg-[var(--accent-1)] text-black font-black uppercase tracking-widest text-xs px-5 py-3 rounded-xl hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                category === cat
                  ? "bg-[var(--accent-1)] text-black"
                  : "bg-[#070707] border border-white/5 text-zinc-400 hover:text-white hover:border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid / Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Package className="w-12 h-12 mb-4 text-zinc-700" />
          <p className="text-sm">No products found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-[#070707] border border-white/5 rounded-2xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-zinc-500 font-medium">
                    Product
                  </th>
                  <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-zinc-500 font-medium">
                    Brand
                  </th>
                  <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-zinc-500 font-medium">
                    Category
                  </th>
                  <th className="text-right px-5 py-4 text-xs uppercase tracking-wider text-zinc-500 font-medium">
                    Price
                  </th>
                  <th className="text-center px-5 py-4 text-xs uppercase tracking-wider text-zinc-500 font-medium">
                    Colors
                  </th>
                  <th className="text-right px-5 py-4 text-xs uppercase tracking-wider text-zinc-500 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, i) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      i < filtered.length - 1 ? "border-b border-white/5" : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
                          {product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate max-w-[200px]">
                            {product.name}
                          </p>
                          {product.isNew && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent-1)]">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-400">
                      {product.brand}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs bg-white/5 text-zinc-300 px-2.5 py-1 rounded-lg">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-right font-semibold text-white">
                      {currency.format(product.price)}
                    </td>
                    <td className="px-5 py-4 text-sm text-center text-zinc-400">
                      {product.colors.length}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="p-2 rounded-lg text-zinc-400 hover:text-[var(--accent-1)] hover:bg-[var(--accent-1)]/10 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        {deleteConfirm === product.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 rounded text-xs font-bold bg-white/5 text-zinc-400 hover:bg-white/10"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-[#070707] border border-white/5 rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {product.brand} · {product.category}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-bold text-[var(--accent-1)]">
                        {currency.format(product.price)}
                      </span>
                      {product.isNew && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent-1)] bg-[var(--accent-1)]/10 px-1.5 py-0.5 rounded">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {product.colors.length} color{product.colors.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-zinc-300 bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </Link>
                  {deleteConfirm === product.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-white/5 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCatalog } from "@/context/CatalogContext";
import {
  Plus,
  Star,
  Trash2,
  Search,
  SlidersHorizontal,
  Tag,
  ChevronDown,
  Edit2,
} from "lucide-react";
import type { Brand } from "@/types/database";
import Link from "next/link";

export default function AdminBrandsPage() {
  const { brands, categories, loading, deleteBrand, updateBrand, addBrand, refresh } =
    useCatalog();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New brand form
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandCategory, setNewBrandCategory] = useState("");
  const [newBrandDescription, setNewBrandDescription] = useState("");
  const [addError, setAddError] = useState("");

  const filteredBrands = useMemo(() => {
    let list = brands;
    if (selectedCategory) {
      list = list.filter((b) => b.category_id === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [brands, selectedCategory, search]);

  // Group brands by category for display
  const groupedBrands = useMemo(() => {
    const groups: Record<string, Brand[]> = {};
    filteredBrands.forEach((b) => {
      if (!groups[b.category_id]) groups[b.category_id] = [];
      groups[b.category_id].push(b);
    });
    return groups;
  }, [filteredBrands]);

  const handleDelete = async (id: string) => {
    try {
      await deleteBrand(id);
      await refresh();
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error("Failed to delete brand:", err);
      alert(err?.message || "Failed to delete brand");
    }
  };

  const handleToggleFeatured = async (brand: Brand) => {
    try {
      await updateBrand(brand.id, { featured: !brand.featured });
      await refresh();
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    if (!newBrandName.trim() || !newBrandCategory) {
      setAddError("Name and category are required.");
      return;
    }

    try {
      await addBrand({
        name: newBrandName.trim(),
        category_id: newBrandCategory,
        slug: newBrandName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
        description: newBrandDescription.trim(),
        logo: "",
        banner: "",
        display_order: brands.length,
        is_active: true,
        featured: false,
      });
      await refresh();
      setNewBrandName("");
      setNewBrandCategory("");
      setNewBrandDescription("");
      setShowAddForm(false);
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : "Failed to add brand"
      );
    }
  };

  const getCategoryName = (slug: string) => {
    const cat = categories.find((c) => c.id === slug || c.slug === slug);
    return cat?.name || slug;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[var(--accent-1)]/20 border-t-[var(--accent-1)] rounded-full animate-spin" />
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
            Loading brands...
          </p>
        </div>
      </div>
    );
  }

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
            Brands
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {brands.length} brands across {categories.length} categories
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 bg-[var(--accent-1)] text-black font-black uppercase tracking-widest text-xs px-5 py-3 rounded-xl hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </button>
      </div>

      {/* Add Brand Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleAddBrand}
              className="bg-[#070707] border border-white/10 rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                New Brand
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    required
                    placeholder="e.g. Rolex"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                    Category *
                  </label>
                  <select
                    value={newBrandCategory}
                    onChange={(e) => setNewBrandCategory(e.target.value)}
                    required
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[var(--accent-1)] focus:outline-none transition-colors"
                    style={{ colorScheme: "dark" }}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  Description
                </label>
                <input
                  type="text"
                  value={newBrandDescription}
                  onChange={(e) => setNewBrandDescription(e.target.value)}
                  placeholder="Short description..."
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
                />
              </div>
              {addError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {addError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-[var(--accent-1)] text-black font-black uppercase tracking-widest text-xs px-6 py-2.5 rounded-xl hover:brightness-110 transition-all"
                >
                  Save Brand
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-zinc-400 text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              !selectedCategory
                ? "bg-[var(--accent-1)] text-black"
                : "bg-[#070707] border border-white/5 text-zinc-400 hover:text-white hover:border-white/10"
            }`}
          >
            All ({brands.length})
          </button>
          {categories
            .filter((c) => c.is_active)
            .map((cat) => {
              const count = brands.filter(
                (b) => b.category_id === cat.slug || b.category_id === cat.id
              ).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug || cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedCategory === cat.slug ||
                    selectedCategory === cat.id
                      ? "bg-[var(--accent-1)] text-black"
                      : "bg-[#070707] border border-white/5 text-zinc-400 hover:text-white hover:border-white/10"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
        Showing {filteredBrands.length} of {brands.length} brands
      </p>

      {/* Brands Grid */}
      {filteredBrands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Tag className="w-12 h-12 mb-4 text-zinc-700" />
          <p className="text-sm">No brands found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedBrands)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([categoryId, categoryBrands]) => (
              <div key={categoryId} className="space-y-4">
                {/* Category Section Header */}
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <span className="w-1.5 h-5 bg-[var(--accent-1)] rounded-full" />
                  <h2 className="text-lg font-black uppercase tracking-wider text-[var(--accent-1)]">
                    {getCategoryName(categoryId)}
                  </h2>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-400 font-bold ml-2">
                    {categoryBrands.length}
                  </span>
                </div>

                {/* Brands Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {categoryBrands.map((brand) => (
                    <motion.div
                      key={brand.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#070707] border border-white/5 rounded-xl p-4 hover:border-[var(--accent-1)]/20 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">
                            {brand.name}
                          </h3>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                            {brand.description || "No description"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleFeatured(brand)}
                          className={`p-1.5 rounded-lg transition-all ${
                            brand.featured
                              ? "text-yellow-400 bg-yellow-500/10"
                              : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
                          }`}
                          title={
                            brand.featured
                              ? "Remove from featured"
                              : "Mark as featured"
                          }
                        >
                          <Star
                            className="w-3.5 h-3.5"
                            fill={brand.featured ? "currentColor" : "none"}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <span
                          className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                            brand.is_active
                              ? "text-green-400 bg-green-500/10"
                              : "text-zinc-500 bg-white/5"
                          }`}
                        >
                          {brand.is_active ? "Active" : "Inactive"}
                        </span>

                        {deleteConfirm === brand.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(brand.id)}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-white/5 text-zinc-400 hover:bg-white/10"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <Link
                              href={`/admin/brands/${brand.id}`}
                              className="p-1.5 rounded-lg text-zinc-600 hover:text-[var(--accent-1)] hover:bg-white/5 transition-all"
                              title="Edit brand"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm(brand.id)}
                              className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Delete brand"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </motion.div>
  );
}

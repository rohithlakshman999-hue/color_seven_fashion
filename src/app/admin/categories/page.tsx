"use client";

import { useMemo } from "react";
import { useCatalog } from "@/context/CatalogContext";
import { Plus, Trash2, Eye, EyeOff, Layers, Cloud, HardDrive } from "lucide-react";
import Link from "next/link";

export default function AdminCategories() {
  const {
    categories,
    brands,
    loading,
    syncedToCloud,
    refresh,
    updateCategory,
    deleteCategory,
  } = useCatalog();

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    brands.forEach((b) => {
      counts[b.category_id] = (counts[b.category_id] || 0) + 1;
    });
    return counts;
  }, [brands]);

  const toggleActive = async (id: string, isActive: boolean) => {
    await updateCategory(id, { is_active: !isActive });
    await refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category and its brands? This cannot be undone.")) return;
    await deleteCategory(id);
    await refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-zinc-400">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-serif text-white">
            Categories
          </h1>
          <p className="text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
            <span>{categories.length} categories</span>
            {syncedToCloud ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-400 font-bold">
                <Cloud className="w-3.5 h-3.5" /> Synced to cloud (all devices)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold">
                <HardDrive className="w-3.5 h-3.5" /> This browser only — add Supabase in .env.local
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#c9a227] text-black font-bold rounded-xl hover:bg-[#d4b239] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#070707] border border-white/10 rounded-2xl p-5 hover:border-[#c9a227]/40 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <Layers className="w-5 h-5 text-[#c9a227]" />
              <button
                onClick={() => toggleActive(cat.id, cat.is_active)}
                title={cat.is_active ? "Active" : "Hidden"}
              >
                {cat.is_active ? (
                  <Eye className="w-5 h-5 text-green-500" />
                ) : (
                  <EyeOff className="w-5 h-5 text-zinc-500" />
                )}
              </button>
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-wide">
              {cat.name}
            </h2>
            <p className="text-sm font-bold text-[#c9a227] mt-1">
              {brandCounts[cat.id] || 0} brands
            </p>
            <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{cat.description}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-2 hover:bg-red-500/10 rounded"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

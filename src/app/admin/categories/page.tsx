"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types/database";
import {
  loadAdminCatalog,
  updateStoredCategory,
  deleteStoredCategory,
} from "@/lib/brandStorage";
import { Plus, Edit2, Trash2, Eye, EyeOff, Layers } from "lucide-react";
import Link from "next/link";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    const { categories: cats, brands } = loadAdminCatalog();
    setCategories(cats);
    const counts: Record<string, number> = {};
    brands.forEach((b) => {
      counts[b.category_id] = (counts[b.category_id] || 0) + 1;
    });
    setBrandCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const toggleActive = (id: string, isActive: boolean) => {
    updateStoredCategory(id, { is_active: !isActive });
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this category and its brands?")) return;
    deleteStoredCategory(id);
    refresh();
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
          <p className="text-zinc-400 mt-1">
            {categories.length} categories · Watches, Shoes, Clothing & more
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

      {/* Category cards — always visible */}
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
            <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
              {cat.description}
            </p>
            <p className="text-xs text-zinc-500 mt-2 font-mono">/{cat.slug}</p>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full">
          <thead className="bg-zinc-900 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-[#c9a227]">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-[#c9a227]">
                Slug
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-[#c9a227]">
                Brands
              </th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-[#c9a227]">
                Description
              </th>
              <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-[#c9a227]">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-[#c9a227]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat.id}
                className="border-b border-white/5 hover:bg-white/[0.03]"
              >
                <td className="px-6 py-4">
                  <span className="font-bold text-white text-base">
                    {cat.name}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-zinc-300">
                  {cat.slug}
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-[#c9a227]">
                    {brandCounts[cat.id] || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-300 max-w-xs truncate">
                  {cat.description}
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => toggleActive(cat.id, cat.is_active)}>
                    {cat.is_active ? (
                      <Eye className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-zinc-500 mx-auto" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/brands?category=${cat.slug}`}
                      className="p-2 hover:bg-white/5 rounded text-xs font-bold text-[#c9a227]"
                    >
                      View Brands
                    </Link>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

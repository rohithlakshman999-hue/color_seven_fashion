"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Category } from "@/types/database";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("categories")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">Loading...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categories Management</h1>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#c9a227] text-black rounded hover:bg-[#d4b239]"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </Link>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full border border-white/10">
          <thead className="bg-zinc-900 border-b border-white/10">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Slug</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-6 py-4">{cat.name}</td>
                <td className="px-6 py-4 text-zinc-400">{cat.slug}</td>
                <td className="px-6 py-4 text-zinc-400 truncate max-w-xs">
                  {cat.description}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleActive(cat.id, cat.is_active)}
                    className="inline-flex items-center justify-center"
                  >
                    {cat.is_active ? (
                      <Eye className="w-5 h-5 text-green-500" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-zinc-500" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/categories/${cat.id}`}
                      className="p-2 hover:bg-white/5 rounded"
                    >
                      <Edit2 className="w-4 h-4 text-[#c9a227]" />
                    </Link>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-2 hover:bg-white/5 rounded"
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

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCatalog } from "@/context/CatalogContext";
import { Plus, Eye, EyeOff, Trash2, Layers, Edit2 } from "lucide-react";
import Link from "next/link";

export default function AdminCategoriesPage() {
  const { categories, loading, deleteCategory, updateCategory, addCategory, refresh } =
    useCatalog();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [addError, setAddError] = useState("");

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateCategory(id, { is_active: !isActive });
      await refresh();
    } catch (err) {
      console.error("Failed to toggle category:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      await refresh();
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error("Failed to delete category:", err);
      alert(err?.message || "Failed to delete category");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    if (!newName.trim() || !newSlug.trim()) {
      setAddError("Name and slug are required.");
      return;
    }
    try {
      await addCategory({
        name: newName.trim(),
        slug: newSlug.trim().toLowerCase().replace(/\s+/g, "-"),
        description: newDescription.trim(),
        image: "",
        icon: "",
        display_order: categories.length,
        is_active: true,
      });
      await refresh();
      setNewName("");
      setNewSlug("");
      setNewDescription("");
      setShowAddForm(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add category");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[var(--accent-1)]/20 border-t-[var(--accent-1)] rounded-full animate-spin" />
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
            Loading categories...
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
            Categories
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {categories.length} categories total
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 bg-[var(--accent-1)] text-black font-black uppercase tracking-widest text-xs px-5 py-3 rounded-xl hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="bg-[#070707] border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            New Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                Name *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNewSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")
                  );
                }}
                required
                placeholder="e.g. Sunglasses"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                Slug *
              </label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                required
                placeholder="sunglasses"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
              Description
            </label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
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
              Save Category
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
      )}

      {/* Categories Table */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Layers className="w-12 h-12 mb-4 text-zinc-700" />
          <p className="text-sm">No categories found</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#070707] border border-white/5 rounded-2xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-zinc-500 font-medium">
                  Name
                </th>
                <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-zinc-500 font-medium">
                  Slug
                </th>
                <th className="text-left px-5 py-4 text-xs uppercase tracking-wider text-zinc-500 font-medium hidden sm:table-cell">
                  Description
                </th>
                <th className="text-center px-5 py-4 text-xs uppercase tracking-wider text-zinc-500 font-medium">
                  Status
                </th>
                <th className="text-right px-5 py-4 text-xs uppercase tracking-wider text-zinc-500 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr
                  key={cat.id}
                  className={`hover:bg-white/[0.02] transition-colors ${
                    i < categories.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <td className="px-5 py-4 text-sm font-semibold text-white">
                    {cat.name}
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-400 font-mono">
                    {cat.slug}
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-500 truncate max-w-xs hidden sm:table-cell">
                    {cat.description || "—"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggleActive(cat.id, cat.is_active)}
                      className="inline-flex items-center justify-center"
                      title={cat.is_active ? "Deactivate" : "Activate"}
                    >
                      {cat.is_active ? (
                        <Eye className="w-5 h-5 text-green-500" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-zinc-500" />
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {deleteConfirm === cat.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(cat.id)}
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
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/categories/${cat.id}`}
                            className="p-2 rounded-lg text-zinc-400 hover:text-[var(--accent-1)] hover:bg-white/5 transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(cat.id)}
                            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

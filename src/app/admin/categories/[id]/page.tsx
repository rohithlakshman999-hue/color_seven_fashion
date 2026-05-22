"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCatalog } from "@/context/CatalogContext";
import { ArrowLeft, Loader, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const { categories, loading: catalogLoading, updateCategory, deleteCategory, refresh } =
    useCatalog();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" as "success" | "error" | "" });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayOrder: "0",
    isActive: true,
  });

  useEffect(() => {
    if (catalogLoading) return;
    const cat = categories.find((c) => c.id === categoryId);
    if (cat) {
      setFormData({
        name: cat.name,
        description: cat.description || "",
        displayOrder: String(cat.display_order ?? 0),
        isActive: cat.is_active,
      });
    } else {
      setMessage({ text: "Category not found", type: "error" });
    }
    setLoading(false);
  }, [categoryId, categories, catalogLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMessage({ text: "Category name is required", type: "error" });
      return;
    }
    setSaving(true);
    try {
      await updateCategory(categoryId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        display_order: parseInt(formData.displayOrder, 10) || 0,
        is_active: formData.isActive,
      });
      await refresh();
      setMessage({ text: "Category updated successfully", type: "success" });
      setTimeout(() => router.push("/admin/categories"), 1200);
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Update failed",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this category and all its brands?")) return;
    setDeleting(true);
    try {
      await deleteCategory(categoryId);
      await refresh();
      router.push("/admin/categories");
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Delete failed",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-[var(--accent-1)]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="p-2 rounded-xl hover:bg-white/5 text-zinc-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-tight">Edit Category</h1>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500 text-green-400"
              : "bg-red-500/10 border-red-500 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-zinc-900/50 border border-white/5 rounded-2xl p-6"
      >
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            required
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            rows={3}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none resize-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500">Display Order</label>
          <input
            type="number"
            value={formData.displayOrder}
            onChange={(e) => setFormData((p) => ({ ...p, displayOrder: e.target.value }))}
            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--accent-1)] focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
            className="w-4 h-4"
          />
          <span className="text-sm text-white">Active</span>
        </label>
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[var(--accent-1)] text-black font-black uppercase text-sm py-3 rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Category"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-lg font-bold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { uploadAdminImage } from "@/lib/imageUpload";
import { addCategory } from "@/lib/catalogStore";
import { useCatalog } from "@/context/CatalogContext";
import AdminSelect, { AdminSelectOption } from "@/components/AdminSelect";
import { ArrowLeft, Upload, Loader, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AddCategoryPage() {
  const router = useRouter();
  const { refresh } = useCatalog();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" as "success" | "error" | "" });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    icon: "",
    displayOrder: "0",
    isActive: true,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Please upload an image file", type: "error" });
      return;
    }

    setUploading(true);
    try {
      const publicUrl = await uploadAdminImage(file, "category-images", "categories");
      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      setImagePreview(publicUrl);
      setMessage({ text: "✓ Image uploaded successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({ text: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`, type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage({ text: "Category name is required", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await addCategory({
        name: formData.name.trim(),
        slug: generateSlug(formData.name),
        description: formData.description.trim(),
        image: formData.imageUrl,
        icon: formData.icon || "",
        display_order: parseInt(formData.displayOrder) || 0,
        is_active: formData.isActive,
      });
      await refresh();

      setMessage({ text: "✓ Category added successfully!", type: "success" });
      setTimeout(() => router.push("/admin/categories"), 1500);
    } catch (error) {
      setMessage({ text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/categories"
          className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-serif">
            Add Category
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Create a new product category
          </p>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`p-4 rounded-lg border flex items-start gap-3 ${
          message.type === "success"
            ? "bg-green-500/10 border-green-500 text-green-400"
            : "bg-red-500/10 border-red-500 text-red-400"
        }`}>
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Basic Information</h3>
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g. Luxury Watches"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Category description..."
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="0"
                placeholder="0"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-white/20 accent-[var(--accent-1)]"
              />
              <span className="text-sm text-white font-medium">Active</span>
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Category Image</h3>

          {imagePreview && (
            <div className="relative w-full h-40 bg-black border border-white/10 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Image URL
            </label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
                if (e.target.value.startsWith("http")) {
                  setImagePreview(e.target.value);
                }
              }}
              placeholder="Paste image URL or upload below"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
            />
          </div>

          <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-white/20 rounded-lg px-6 py-8 cursor-pointer hover:border-[var(--accent-1)] hover:bg-white/5 transition-all">
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin text-[var(--accent-1)]" />
                <span className="text-sm text-zinc-400">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-zinc-400" />
                <span className="text-sm text-zinc-400">Upload Category Image</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload(e.target.files[0]);
                }
              }}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[var(--accent-1)] text-black font-black uppercase tracking-widest text-sm px-6 py-4 rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Add Category
            </>
          )}
        </button>
      </form>
    </div>
  );
}

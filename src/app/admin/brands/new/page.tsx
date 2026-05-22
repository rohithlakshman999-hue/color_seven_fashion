"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCatalog } from "@/context/CatalogContext";
import { uploadAdminImage } from "@/lib/imageUpload";
import AdminSelect, { AdminSelectOption } from "@/components/AdminSelect";
import { ArrowLeft, Upload, X, Loader, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AddBrandPage() {
  const router = useRouter();
  const { categories: allCategories, loading: catalogLoading, addBrand, refresh } = useCatalog();
  const categories = allCategories.filter((c) => c.is_active);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" as "success" | "error" | "" });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    logoUrl: "",
    bannerUrl: "",
    website: "",
    displayOrder: "0",
    featured: false,
    isActive: true,
  });

  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  useEffect(() => {
    if (!catalogLoading) {
      if (categories.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
      }
      setLoading(false);
    }
  }, [catalogLoading, categories, formData.categoryId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Please upload an image file", type: "error" });
      return;
    }

    setUploadingLogo(true);
    try {
      const publicUrl = await uploadAdminImage(file, "brand-logos", "logos");
      setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
      setLogoPreview(publicUrl);
      setMessage({ text: "✓ Logo uploaded successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({ text: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`, type: "error" });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Please upload an image file", type: "error" });
      return;
    }

    setUploadingBanner(true);
    try {
      const publicUrl = await uploadAdminImage(file, "brand-banners", "banners");
      setFormData(prev => ({ ...prev, bannerUrl: publicUrl }));
      setBannerPreview(publicUrl);
      setMessage({ text: "✓ Banner uploaded successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({ text: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`, type: "error" });
    } finally {
      setUploadingBanner(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.categoryId) {
      setMessage({ text: "Brand name and category are required", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const category = categories.find((c) => c.id === formData.categoryId);
      if (!category) throw new Error("Invalid category");

      await addBrand({
        category_id: formData.categoryId,
        name: formData.name.trim(),
        slug: generateSlug(formData.name),
        description: formData.description.trim(),
        logo: formData.logoUrl || "",
        banner: formData.bannerUrl || "",
        website: formData.website.trim() || undefined,
        display_order: parseInt(formData.displayOrder) || 0,
        featured: formData.featured,
        is_active: formData.isActive,
      });
      await refresh();

      setMessage({ text: "✓ Brand added successfully!", type: "success" });
      setTimeout(() => router.push("/admin/brands"), 1500);
    } catch (error) {
      setMessage({ text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`, type: "error" });
    } finally {
      setSaving(false);
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/brands"
          className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-serif">
            Add Brand
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Create a new brand with logo and banner
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
              Brand Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g. Rolex"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Category *
            </label>
            <AdminSelect
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              placeholder={`Select Category (${categories.length} available)`}
            >
              {categories.map((cat) => (
                <AdminSelectOption key={`cat-${cat.id}`} optionKey={`cat-${cat.id}`} value={cat.id}>
                  {cat.name}
                </AdminSelectOption>
              ))}
            </AdminSelect>
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
              placeholder="Brand description and details..."
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Website URL
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
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
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Brand Logo</h3>

          {logoPreview && (
            <div className="relative w-32 h-32 bg-black border border-white/10 rounded-lg overflow-hidden">
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="w-full h-full object-contain p-2"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, logoUrl: "" }));
                  setLogoPreview("");
                }}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Logo URL
            </label>
            <input
              type="text"
              value={formData.logoUrl}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, logoUrl: e.target.value }));
                if (e.target.value.startsWith("http")) {
                  setLogoPreview(e.target.value);
                }
              }}
              placeholder="Paste logo URL or upload below"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
            />
          </div>

          <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-white/20 rounded-lg px-6 py-6 cursor-pointer hover:border-[var(--accent-1)] hover:bg-white/5 transition-all">
            {uploadingLogo ? (
              <>
                <Loader className="w-5 h-5 animate-spin text-[var(--accent-1)]" />
                <span className="text-sm text-zinc-400">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-zinc-400" />
                <span className="text-sm text-zinc-400">Upload Brand Logo</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleLogoUpload(e.target.files[0]);
                }
              }}
              disabled={uploadingLogo}
              className="hidden"
            />
          </label>
        </div>

        {/* Banner Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Brand Banner</h3>

          {bannerPreview && (
            <div className="relative w-full h-32 bg-black border border-white/10 rounded-lg overflow-hidden">
              <img
                src={bannerPreview}
                alt="Banner Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, bannerUrl: "" }));
                  setBannerPreview("");
                }}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Banner URL
            </label>
            <input
              type="text"
              value={formData.bannerUrl}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, bannerUrl: e.target.value }));
                if (e.target.value.startsWith("http")) {
                  setBannerPreview(e.target.value);
                }
              }}
              placeholder="Paste banner URL or upload below"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
            />
          </div>

          <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-white/20 rounded-lg px-6 py-6 cursor-pointer hover:border-[var(--accent-1)] hover:bg-white/5 transition-all">
            {uploadingBanner ? (
              <>
                <Loader className="w-5 h-5 animate-spin text-[var(--accent-1)]" />
                <span className="text-sm text-zinc-400">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-zinc-400" />
                <span className="text-sm text-zinc-400">Upload Brand Banner (recommended: 1200x400)</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleBannerUpload(e.target.files[0]);
                }
              }}
              disabled={uploadingBanner}
              className="hidden"
            />
          </label>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-white/20 accent-[var(--accent-1)]"
              />
              <span className="text-sm text-white font-medium">Featured Brand</span>
            </label>

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

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[var(--accent-1)] text-black font-black uppercase tracking-widest text-sm px-6 py-4 rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Add Brand
            </>
          )}
        </button>
      </form>
    </div>
  );
}

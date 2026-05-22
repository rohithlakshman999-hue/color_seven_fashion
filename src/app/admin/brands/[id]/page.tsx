"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { uploadAdminImage } from "@/lib/imageUpload";
import { Brand } from "@/types/database";
import { useCatalog } from "@/context/CatalogContext";
import { useProducts, type Product as StoreProduct } from "@/context/ProductContext";
import AdminSelect, { AdminSelectOption } from "@/components/AdminSelect";
import { ArrowLeft, Upload, X, Loader, AlertCircle, CheckCircle, Trash2, Plus, Package, Edit2 } from "lucide-react";
import Link from "next/link";

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = params.id as string;
  const { products: storeProducts, deleteProduct } = useProducts();
  const {
    categories,
    brands,
    loading: catalogLoading,
    updateBrand,
    deleteBrand,
    refresh,
  } = useCatalog();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" }>({ text: "", type: "success" });
  const [brand, setBrand] = useState<Brand | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    website: "",
    displayOrder: "0",
    featured: false,
    isActive: true,
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const brandProducts: StoreProduct[] = brand
    ? storeProducts.filter((p) => p.brand === brand.name)
    : [];

  useEffect(() => {
    if (catalogLoading) return;
    const b = brands.find((x) => x.id === brandId);
    if (b) {
      setBrand(b);
      setFormData({
        name: b.name,
        categoryId: b.category_id,
        description: b.description || "",
        website: b.website || "",
        displayOrder: b.display_order?.toString() || "0",
        featured: b.featured,
        isActive: b.is_active,
      });
      if (b.logo) {
        setLogoUrl(b.logo);
        setLogoPreview(b.logo);
      }
      if (b.banner) {
        setBannerUrl(b.banner);
        setBannerPreview(b.banner);
      }
    } else {
      setMessage({ text: "Brand not found", type: "error" });
    }
    setLoading(false);
  }, [brandId, brands, catalogLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = async (type: "logo" | "banner", file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Please upload an image file", type: "error" });
      return;
    }

    if (type === "logo") setUploadingLogo(true);
    else setUploadingBanner(true);

    try {
      const bucket: "brand-logos" | "brand-banners" = type === "logo" ? "brand-logos" : "brand-banners";
      const folder = type === "logo" ? "logos" : "banners";
      const publicUrl = await uploadAdminImage(file, bucket, folder);

      if (type === "logo") {
        setLogoUrl(publicUrl);
        setLogoPreview(publicUrl);
      } else {
        setBannerUrl(publicUrl);
        setBannerPreview(publicUrl);
      }

      setMessage({ text: `${type === "logo" ? "Logo" : "Banner"} uploaded successfully!`, type: "success" });
      setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
    } catch (error) {
      setMessage({ text: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`, type: "error" });
    } finally {
      if (type === "logo") setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId) {
      setMessage({ text: "Please fill in all required fields", type: "error" });
      return;
    }

    setSaving(true);
    try {
      await updateBrand(brandId, {
        name: formData.name,
        category_id: formData.categoryId,
        description: formData.description,
        website: formData.website,
        logo: logoUrl,
        banner: bannerUrl,
        display_order: parseInt(formData.displayOrder),
        featured: formData.featured,
        is_active: formData.isActive,
      });
      await refresh();

      setMessage({ text: "✓ Brand updated successfully!", type: "success" });
      setTimeout(() => router.push("/admin/brands"), 1500);
    } catch (error) {
      setMessage({ text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this brand? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      await deleteBrand(brandId);
      await refresh();
      setMessage({ text: "✓ Brand deleted successfully!", type: "success" });
      setTimeout(() => router.push("/admin/brands"), 1500);
    } catch (error) {
      setMessage({ text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`, type: "error" });
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
    <div className="max-w-4xl mx-auto space-y-6">
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
            Edit Brand
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {formData.name || "Loading..."}
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
          <h3 className="text-lg font-bold text-white">Brand Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Brand Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Category *</label>
              <AdminSelect
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                placeholder="Select Category"
              >
                {categories.map((cat) => (
                  <AdminSelectOption key={`cat-${cat.id}`} optionKey={`cat-${cat.id}`} value={cat.id}>
                    {cat.name}
                  </AdminSelectOption>
                ))}
              </AdminSelect>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Website URL</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Brand Logo</h3>
          
          {logoPreview && (
            <div className="relative w-full h-32 bg-black border border-white/10 rounded-lg overflow-hidden">
              <img
                src={logoPreview}
                alt="Brand Logo"
                className="w-full h-full object-contain p-4"
              />
              <button
                type="button"
                onClick={() => {
                  setLogoUrl("");
                  setLogoPreview("");
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 rounded text-white hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-white/20 rounded-lg px-3 py-6 cursor-pointer hover:border-[var(--accent-1)] hover:bg-white/5 transition-all">
            {uploadingLogo ? (
              <>
                <Loader className="w-5 h-5 animate-spin text-[var(--accent-1)]" />
                <span className="text-sm text-zinc-400">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-zinc-400" />
                <span className="text-sm text-zinc-400">Upload Logo (PNG/JPG)</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload("logo", e.target.files[0]);
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
            <div className="relative w-full h-40 bg-black border border-white/10 rounded-lg overflow-hidden">
              <img
                src={bannerPreview}
                alt="Brand Banner"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setBannerUrl("");
                  setBannerPreview("");
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 rounded text-white hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-white/20 rounded-lg px-3 py-6 cursor-pointer hover:border-[var(--accent-1)] hover:bg-white/5 transition-all">
            {uploadingBanner ? (
              <>
                <Loader className="w-5 h-5 animate-spin text-[var(--accent-1)]" />
                <span className="text-sm text-zinc-400">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-zinc-400" />
                <span className="text-sm text-zinc-400">Upload Banner (PNG/JPG)</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload("banner", e.target.files[0]);
                }
              }}
              disabled={uploadingBanner}
              className="hidden"
            />
          </label>
        </div>

        {/* Status */}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-white">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-white">Active</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--accent-1)] text-black font-black uppercase tracking-widest text-sm px-6 py-4 rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Update Brand
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-2 bg-red-500/10 text-red-400 font-bold uppercase tracking-widest text-sm px-6 py-4 rounded-lg hover:bg-red-500/20 disabled:opacity-50 transition-all"
          >
            {deleting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </form>

      {/* Products Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tight font-serif">
            Products ({brandProducts.length})
          </h2>
          <Link
            href="/admin/products/add"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-1)] text-black rounded hover:brightness-110 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>

        {brandProducts.length === 0 ? (
          <div className="p-12 bg-zinc-900/50 border border-white/5 rounded-2xl text-center">
            <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Products Yet</h3>
            <p className="text-zinc-500 mb-6">Add a product and select this brand in the form</p>
            <Link
              href="/admin/products/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-1)] text-black rounded font-bold hover:brightness-110 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 bg-zinc-900/50 border border-white/5 rounded-lg hover:border-[var(--accent-1)]/40 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-zinc-500">{product.category}</p>
                  </div>
                  <div className="flex gap-1">
                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="p-2 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (!confirm("Delete this product? It will be removed from the store.")) return;
                        deleteProduct(product.id);
                        setMessage({ text: "Product deleted from store", type: "success" });
                      }}
                      className="p-2 rounded hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{product.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[var(--accent-1)]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                </div>
                {product.isNew && (
                  <span className="mt-2 inline-block text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded">
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

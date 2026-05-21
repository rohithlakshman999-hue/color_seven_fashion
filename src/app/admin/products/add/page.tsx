"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Category, Brand } from "@/types/database";
import { useCatalog } from "@/context/CatalogContext";
import { useProducts } from "@/context/ProductContext";
import { slugToProductCategory } from "@/lib/catalogHelpers";
import { brandOptionKey } from "@/lib/catalogHelpers";
import AdminSelect, { AdminSelectOption } from "@/components/AdminSelect";
import { ArrowLeft, Upload, X, Loader, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AddProductPage() {
  const router = useRouter();
  const { categories, brands, loading: catalogLoading } = useCatalog();
  const { addProduct } = useProducts();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" as "success" | "error" });
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    fullDescription: "",
    sku: "",
    tags: "",
    categoryId: "",
    brandId: "",
    originalPrice: "",
    discountPrice: "",
    offerPercentage: "",
    stockQuantity: "",
    stockStatus: "in_stock" as "in_stock" | "out_of_stock" | "low_stock",
    collectionType: "",
    featured: false,
    isActive: true,
    colors: [] as string[],
    sizes: [] as string[],
    materials: [] as string[],
  });

  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [materialInput, setMaterialInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>(["", "", "", "", ""]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(["", "", "", "", ""]);

  useEffect(() => {
    if (!catalogLoading) setLoading(false);
  }, [catalogLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      };
      if (name === "categoryId") {
        next.brandId = "";
      }
      return next;
    });
  };

  const brandsForCategory = formData.categoryId
    ? brands.filter((b) => b.category_id === formData.categoryId)
    : brands;

  const handleImageUrlChange = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
    if (url.startsWith("http")) {
      const newPreviews = [...imagePreviews];
      newPreviews[index] = url;
      setImagePreviews(newPreviews);
    }
  };

  const handleImageUpload = async (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Please upload an image file", type: "error" });
      return;
    }

    const uploadingStates = new Array(5).fill(false);
    uploadingStates[index] = true;
    setUploadingImages(uploadingStates);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      if (!supabase) {
        setMessage({ text: "Image upload requires Supabase configuration", type: "error" });
        return;
      }
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(`products/${fileName}`, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from("product-images")
        .getPublicUrl(`products/${fileName}`);

      const newUrls = [...imageUrls];
      newUrls[index] = publicUrl.publicUrl;
      setImageUrls(newUrls);

      const newPreviews = [...imagePreviews];
      newPreviews[index] = publicUrl.publicUrl;
      setImagePreviews(newPreviews);

      setMessage({ text: "Image uploaded successfully", type: "success" });
    } catch (error) {
      setMessage({ text: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`, type: "error" });
    } finally {
      const uploadingStates = new Array(5).fill(false);
      setUploadingImages(uploadingStates);
    }
  };

  const addTag = (input: string, setter: React.Dispatch<React.SetStateAction<string>>, field: "colors" | "sizes" | "materials") => {
    const val = input.trim();
    if (val && !formData[field].includes(val)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], val],
      }));
      setter("");
    }
  };

  const removeTag = (value: string, field: "colors" | "sizes" | "materials") => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId || !formData.brandId || !formData.name) {
      setMessage({ text: "Please fill in all required fields", type: "error" });
      return;
    }

    const selectedCategory = categories.find((c) => c.id === formData.categoryId);
    const selectedBrand = brands.find((b) => b.id === formData.brandId);
    if (!selectedCategory || !selectedBrand) {
      setMessage({ text: "Please select a valid category and brand", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const validImages = imageUrls.filter((url) => url.trim() !== "");
      const price =
        parseFloat(formData.discountPrice) ||
        parseFloat(formData.originalPrice) ||
        0;

      await addProduct({
        name: formData.name.trim(),
        brand: selectedBrand.name,
        price,
        category: slugToProductCategory(selectedCategory.slug),
        images:
          validImages.length > 0
            ? validImages
            : ["/images/chrono_watch.png"],
        description:
          formData.fullDescription.trim() ||
          formData.shortDescription.trim() ||
          `${formData.name} — ${selectedBrand.name}`,
        sizes: formData.sizes.length > 0 ? formData.sizes : ["One Size"],
        colors: formData.colors.length > 0 ? formData.colors : ["Default"],
        isNew: formData.featured,
      });

      setMessage({ text: "✓ Product added successfully!", type: "success" });
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (error) {
      console.error("Error:", error);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-serif">
            Add Product
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Create a new product with images, variants, and pricing
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
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g. PREMIUM LEATHER WATCH"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <AdminSelectOption
                    optionKey={`cat-${cat.id}`}
                    value={cat.id}
                  >
                    {cat.name}
                  </AdminSelectOption>
                ))}
              </AdminSelect>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                Brand *
              </label>
              <AdminSelect
                name="brandId"
                value={formData.brandId}
                onChange={handleInputChange}
                disabled={!formData.categoryId}
                required
                placeholder={
                  formData.categoryId
                    ? `Select Brand (${brandsForCategory.length} available)`
                    : "Select a category first"
                }
              >
                {brandsForCategory.map((brand) => (
                  <AdminSelectOption
                    optionKey={brandOptionKey(brand)}
                    value={brand.id}
                  >
                    {brand.name}
                  </AdminSelectOption>
                ))}
              </AdminSelect>
              {!formData.categoryId && (
                <p className="text-xs font-bold text-[#c9a227] mt-1">
                  Select a category first to see brands (Watches, Shoes, etc.)
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="e.g. WATCH-001"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                Collection Type
              </label>
              <input
                type="text"
                name="collectionType"
                value={formData.collectionType}
                onChange={handleInputChange}
                placeholder="e.g. Summer 2026"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Descriptions</h3>
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Short Description
            </label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              placeholder="Brief 1-line description"
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Full Description
            </label>
            <textarea
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleInputChange}
              rows={4}
              placeholder="Detailed product description with features and benefits..."
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Pricing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                Original Price (₹) *
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="9999"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                Discount Price (₹)
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="7999"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                Discount %
              </label>
              <input
                type="number"
                name="offerPercentage"
                value={formData.offerPercentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                placeholder="20"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Inventory</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                min="0"
                placeholder="50"
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                Stock Status
              </label>
              <AdminSelect
                name="stockStatus"
                value={formData.stockStatus}
                onChange={handleInputChange}
              >
                <AdminSelectOption optionKey="stock-in" value="in_stock">
                  In Stock
                </AdminSelectOption>
                <AdminSelectOption optionKey="stock-low" value="low_stock">
                  Low Stock
                </AdminSelectOption>
                <AdminSelectOption optionKey="stock-out" value="out_of_stock">
                  Out of Stock
                </AdminSelectOption>
              </AdminSelect>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Product Images</h3>
          <p className="text-xs text-zinc-400">Upload images or paste image URLs (up to 5)</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="text-xs text-zinc-500 font-medium">
                  {index === 0 ? "Main Image" : `Image ${index + 1}`}
                  {index < 2 && <span className="text-[var(--accent-1)] ml-1">*</span>}
                </div>

                {/* Preview */}
                {imagePreviews[index] && (
                  <div className="relative w-full h-32 bg-black border border-white/10 rounded-lg overflow-hidden">
                    <Image
                      src={imagePreviews[index]}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newUrls = [...imageUrls];
                        newUrls[index] = "";
                        setImageUrls(newUrls);
                        const newPreviews = [...imagePreviews];
                        newPreviews[index] = "";
                        setImagePreviews(newPreviews);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 rounded text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* URL Input */}
                <input
                  type="text"
                  value={imageUrls[index]}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  placeholder="Paste image URL or upload below"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors text-sm"
                />

                {/* Upload */}
                <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-white/20 rounded-lg px-3 py-2 cursor-pointer hover:border-[var(--accent-1)] hover:bg-white/5 transition-all">
                  {uploadingImages[index] ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin text-[var(--accent-1)]" />
                      <span className="text-xs text-zinc-400">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs text-zinc-400">Upload Image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageUpload(index, e.target.files[0]);
                      }
                    }}
                    disabled={uploadingImages[index]}
                    className="hidden"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Variants & Specifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Variants & Specifications</h3>

          {/* Colors */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Colors
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.colors.map((color) => (
                <span
                  key={color}
                  className="flex items-center gap-1.5 text-xs bg-[var(--accent-1)]/10 text-[var(--accent-1)] px-3 py-1.5 rounded-lg font-medium"
                >
                  {color}
                  <button
                    type="button"
                    onClick={() => removeTag(color, "colors")}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(colorInput, setColorInput, "colors");
                  }
                }}
                placeholder="Type color and press Enter (e.g. Black, Gold)"
                className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => addTag(colorInput, setColorInput, "colors")}
                className="px-4 py-3 bg-[var(--accent-1)] text-black rounded-lg font-bold hover:brightness-110 transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Sizes
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.sizes.map((size) => (
                <span
                  key={size}
                  className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg font-medium"
                >
                  {size}
                  <button
                    type="button"
                    onClick={() => removeTag(size, "sizes")}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(sizeInput, setSizeInput, "sizes");
                  }
                }}
                placeholder="Type size and press Enter (e.g. M, L, XL)"
                className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => addTag(sizeInput, setSizeInput, "sizes")}
                className="px-4 py-3 bg-[var(--accent-1)] text-black rounded-lg font-bold hover:brightness-110 transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Materials */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Materials
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.materials.map((material) => (
                <span
                  key={material}
                  className="flex items-center gap-1.5 text-xs bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-lg font-medium"
                >
                  {material}
                  <button
                    type="button"
                    onClick={() => removeTag(material, "materials")}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={materialInput}
                onChange={(e) => setMaterialInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(materialInput, setMaterialInput, "materials");
                  }
                }}
                placeholder="Type material and press Enter (e.g. Leather, Steel)"
                className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => addTag(materialInput, setMaterialInput, "materials")}
                className="px-4 py-3 bg-[var(--accent-1)] text-black rounded-lg font-bold hover:brightness-110 transition-all"
              >
                Add
              </button>
            </div>
          </div>
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
              <span className="text-sm text-white font-medium">Mark as Featured Product</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-white/20 accent-[var(--accent-1)]"
              />
              <span className="text-sm text-white font-medium">Active / Published</span>
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
              Add Product
            </>
          )}
        </button>
      </form>
    </div>
  );
}

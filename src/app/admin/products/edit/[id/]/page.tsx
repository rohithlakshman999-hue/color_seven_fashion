"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product, Category, Brand, ProductImage } from "@/types/database";
import { ArrowLeft, Upload, X, Loader, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" as "success" | "error" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    fullDescription: "",
    sku: "",
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
  const [newImageUrls, setNewImageUrls] = useState<string[]>(["", "", "", "", ""]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(["", "", "", "", ""]);

  useEffect(() => {
    fetchData();
  }, [productId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, brandRes, productRes, imagesRes] = await Promise.all([
        supabase.from("categories").select("*").order("display_order"),
        supabase.from("brands").select("*").order("display_order"),
        supabase.from("products").select("*").eq("id", productId).single(),
        supabase.from("product_images").select("*").eq("product_id", productId).order("display_order"),
      ]);

      if (catRes.data) setCategories(catRes.data);
      if (brandRes.data) setBrands(brandRes.data);
      
      if (productRes.data) {
        const p = productRes.data;
        setProduct(p);
        setFormData({
          name: p.name,
          shortDescription: p.short_description || "",
          fullDescription: p.full_description || "",
          sku: p.sku,
          categoryId: p.category_id,
          brandId: p.brand_id,
          originalPrice: p.original_price.toString(),
          discountPrice: p.discount_price.toString(),
          offerPercentage: p.offer_percentage.toString(),
          stockQuantity: "0",
          stockStatus: "in_stock",
          collectionType: p.collection || "",
          featured: p.featured,
          isActive: p.is_active,
          colors: p.tags ? p.tags.filter((t: string) => !["S", "M", "L", "XL", "XXL"].includes(t)) : [],
          sizes: p.tags ? p.tags.filter((t: string) => ["S", "M", "L", "XL", "XXL"].includes(t)) : [],
          materials: [],
        });
      }

      if (imagesRes.data) {
        setImages(imagesRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ text: "Failed to load product data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
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
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(`products/${fileName}`, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from("product-images")
        .getPublicUrl(`products/${fileName}`);

      const newUrls = [...newImageUrls];
      newUrls[index] = publicUrl.publicUrl;
      setNewImageUrls(newUrls);

      const newPreviews = [...imagePreviews];
      newPreviews[index] = publicUrl.publicUrl;
      setImagePreviews(newPreviews);

      setMessage({ text: "Image uploaded successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({ text: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`, type: "error" });
    } finally {
      setUploadingImages(new Array(5).fill(false));
    }
  };

  const addTag = (input: string, field: "colors" | "sizes" | "materials") => {
    const val = input.trim();
    if (val && !formData[field].includes(val)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], val],
      }));
      if (field === "colors") setColorInput("");
      if (field === "sizes") setSizeInput("");
      if (field === "materials") setMaterialInput("");
    }
  };

  const removeTag = (value: string, field: "colors" | "sizes" | "materials") => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value),
    }));
  };

  const removeExistingImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from("product_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;
      setImages(images.filter(img => img.id !== imageId));
      setMessage({ text: "Image removed", type: "success" });
    } catch (error) {
      setMessage({ text: `Failed to remove image: ${error instanceof Error ? error.message : "Unknown error"}`, type: "error" });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId || !formData.brandId || !formData.name) {
      setMessage({ text: "Please fill in all required fields", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: formData.name,
        short_description: formData.shortDescription,
        full_description: formData.fullDescription,
        sku: formData.sku,
        tags: formData.colors.concat(formData.sizes).concat(formData.materials),
        original_price: parseFloat(formData.originalPrice) || 0,
        discount_price: parseFloat(formData.discountPrice) || 0,
        offer_percentage: parseInt(formData.offerPercentage) || 0,
        collection: formData.collectionType,
        featured: formData.featured,
        is_active: formData.isActive,
      };

      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", productId);

      if (error) throw error;

      // Add new images
      const validNewImages = newImageUrls.filter(url => url.trim() !== "");
      if (validNewImages.length > 0) {
        const startOrder = images.length;
        for (let i = 0; i < validNewImages.length; i++) {
          await supabase.from("product_images").insert([
            {
              product_id: productId,
              image_url: validNewImages[i],
              display_order: startOrder + i,
              is_main: images.length === 0 && i === 0,
            },
          ]);
        }
      }

      setMessage({ text: "✓ Product updated successfully!", type: "success" });
      setTimeout(() => router.push("/admin/products"), 1500);
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
            Edit Product
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
          <h3 className="text-lg font-bold text-white">Product Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Original Price (₹)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Discount Price (₹)</label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleInputChange}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">Full Description</label>
            <textarea
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {/* Current Images */}
        {images.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Current Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <div className="relative w-full h-32 bg-black border border-white/10 rounded-lg overflow-hidden">
                    <Image
                      src={img.image_url}
                      alt="Product"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute top-1 right-1 p-1.5 bg-red-500 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Add More Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-white/20 rounded-lg px-3 py-6 cursor-pointer hover:border-[var(--accent-1)] hover:bg-white/5 transition-all">
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

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[var(--accent-1)] text-black font-black uppercase tracking-widest text-sm px-6 py-4 rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {saving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Update Product
            </>
          )}
        </button>
      </form>
    </div>
  );
}

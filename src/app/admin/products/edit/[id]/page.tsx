"use client";

import { useState, useEffect, useRef, KeyboardEvent, FormEvent, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, X, Save, AlertCircle, Loader, Upload, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useProducts } from "@/context/ProductContext";
import { useCatalog } from "@/context/CatalogContext";
import { uploadAdminImage } from "@/lib/imageUpload";
import {
  PRODUCT_CATEGORIES,
  getBrandsForProductCategory,
  brandOptionKey,
} from "@/lib/catalogHelpers";
import AdminSelect, { AdminSelectOption } from "@/components/AdminSelect";

function convertGoogleDriveUrl(url: string): string {
  const trimmed = url.trim();
  
  // Pattern 1: drive.google.com/file/d/FILE_ID/...
  const fileDRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match1 = trimmed.match(fileDRegex);
  if (match1 && match1[1]) {
    return `https://docs.google.com/uc?export=view&id=${match1[1]}`;
  }

  // Pattern 2: drive.google.com/open?id=FILE_ID or docs.google.com/open?id=FILE_ID
  const openIdRegex = /[drive|docs]\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  const match2 = trimmed.match(openIdRegex);
  if (match2 && match2[1]) {
    return `https://docs.google.com/uc?export=view&id=${match2[1]}`;
  }

  // Pattern 3: docs.google.com/file/d/FILE_ID/...
  const docsDRegex = /docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match3 = trimmed.match(docsDRegex);
  if (match3 && match3[1]) {
    return `https://docs.google.com/uc?export=view&id=${match3[1]}`;
  }

  return trimmed;
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getProductById, updateProduct, loaded: productsLoaded } = useProducts();
  const { brands: catalogBrands, loading: catalogLoading } = useCatalog();

  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<"Watches" | "Shoes" | "Clothes" | "Accessories">("Watches");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([""]);
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([]);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!productsLoaded || catalogLoading) return;

    const product = getProductById(id);
    if (!product) {
      setNotFound(true);
      setLoaded(true);
      return;
    }

    setName(product.name);
    setBrand(product.brand);

    const available = getBrandsForProductCategory(
      product.category,
      catalogBrands
    );
    const isPredefined = available.some((b) => b.name === product.brand);
    if (!isPredefined && product.brand) {
      setIsCustomBrand(true);
      setCustomBrand(product.brand);
    } else {
      setIsCustomBrand(false);
      setCustomBrand("");
    }

    setPrice(String(product.price));
    setCategory(product.category);
    setDescription(product.description);
    setImages(product.images.length > 0 ? [...product.images] : [""]);
    setColors([...product.colors]);
    setSizes([...product.sizes]);
    setIsNew(product.isNew);
    setIsTrending(product.isTrending || false);
    setLoaded(true);
    initialLoadDone.current = true;
  }, [id, getProductById, catalogBrands, productsLoaded, catalogLoading]);

  const brandsForCategory = getBrandsForProductCategory(
    category,
    catalogBrands
  );

  const addImageField = () => {
    if (images.length < 5) {
      setImages([...images, ""]);
    }
  };

  const updateImage = (index: number, value: string) => {
    const converted = convertGoogleDriveUrl(value);
    const updated = [...images];
    updated[index] = converted;
    setImages(updated);
  };

  const handleImageUpload = async (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const uploadingStates = new Array(5).fill(false);
    uploadingStates[index] = true;
    setUploadingImages(uploadingStates);

    try {
      const publicUrl = await uploadAdminImage(file, "product-images", "products");
      updateImage(index, publicUrl);
    } catch (error) {
      alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      const uploadingStates = new Array(5).fill(false);
      setUploadingImages(uploadingStates);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-[var(--accent-1)]", "bg-white/5");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-[var(--accent-1)]", "bg-white/5");
  };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-[var(--accent-1)]", "bg-white/5");
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        await handleImageUpload(index, file);
      } else {
        alert("Please drop an image file.");
      }
      return;
    }

    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (url) {
      updateImage(index, url);
    }
  };

  const removeImage = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const handleColorKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = colorInput.trim();
      if (val && !colors.includes(val)) {
        setColors([...colors, val]);
      }
      setColorInput("");
    }
  };

  const removeColor = (color: string) => {
    setColors(colors.filter((c) => c !== color));
  };

  const handleSizeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = sizeInput.trim();
      if (val && !sizes.includes(val)) {
        setSizes([...sizes, val]);
      }
      setSizeInput("");
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter((s) => s !== size));
  };

  const normalizePrice = (value: string) => {
    const cleaned = value.trim().replace(/[^\\d.]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? Math.round(parsed) : 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validImages = images.map((i) => i.trim()).filter(Boolean);
    if (!name.trim() || !price || validImages.length === 0) return;

    const finalBrand = isCustomBrand ? customBrand.trim() : brand.trim();
    updateProduct(id, {
      name: name.trim(),
      brand: finalBrand || "Colour Seven",
      price: normalizePrice(price),
      category,
      images: validImages,
      description: description.trim(),
      sizes,
      colors,
      isNew,
      isTrending,
    });

    router.push("/admin/products");
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Loading...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
        <AlertCircle className="w-12 h-12 mb-4 text-zinc-700" />
        <p className="text-sm mb-4">Product not found</p>
        <Link
          href="/admin/products"
          className="text-[var(--accent-1)] text-sm hover:underline"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto space-y-6"
    >
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
            Update product details
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Product Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. OVERSIZED HOODIE"
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
          />
        </div>

        {/* Brand + Price row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Brand
            </label>
            <div className="space-y-2">
              <AdminSelect
                value={isCustomBrand ? "Custom" : brand}
                onChange={(e) => {
                  if (e.target.value === "Custom") {
                    setIsCustomBrand(true);
                  } else {
                    setIsCustomBrand(false);
                    setBrand(e.target.value);
                  }
                }}
              >
                {brandsForCategory.map((b) => (
                  <AdminSelectOption
                    key={brandOptionKey(b)}
                    optionKey={brandOptionKey(b)}
                    value={b.name}
                  >
                    {b.name}
                  </AdminSelectOption>
                ))}
                <AdminSelectOption optionKey="brand-custom" value="Custom">
                  Custom / Other Brand...
                </AdminSelectOption>
              </AdminSelect>

              {isCustomBrand && (
                <input
                  type="text"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="Type custom brand name"
                  required
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
                />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Price (₹) *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="1"
              placeholder="1799"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Category *
          </label>
          <AdminSelect
            value={category}
            onChange={(e) => {
              const next = e.target.value as typeof category;
              setCategory(next);
              if (initialLoadDone.current && !isCustomBrand) {
                const list = getBrandsForProductCategory(
                  next,
                  catalogBrands
                );
                if (list.length > 0) setBrand(list[0].name);
              }
            }}
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <AdminSelectOption key={`cat-${cat}`} optionKey={`cat-${cat}`} value={cat}>
                {cat}
              </AdminSelectOption>
            ))}
          </AdminSelect>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Product description..."
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Images */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Product Images (up to 5)
            </label>
            {images.length < 5 && (
              <button
                type="button"
                onClick={addImageField}
                className="flex items-center gap-1.5 text-xs text-[var(--accent-1)] bg-[var(--accent-1)]/10 px-3 py-1.5 rounded-lg hover:bg-[var(--accent-1)]/20 transition-all font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Image Slot
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">Drag & drop files or paste URLs (Main image is the first slot)</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {images.map((img, index) => (
              <div key={index} className="space-y-2 p-4 rounded-xl border border-white/5 bg-zinc-900/40">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                    {index === 0 ? "Main Image" : `Image ${index + 1}`}
                    {index < 2 && <span className="text-[var(--accent-1)] ml-1">*</span>}
                  </div>
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove Slot
                    </button>
                  )}
                </div>

                {/* Preview */}
                {img && (
                  <div className="relative w-full h-32 bg-black border border-white/10 rounded-lg overflow-hidden">
                    <Image
                      src={img}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        updateImage(index, "");
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
                  value={img}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder="Paste image URL or upload below"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors text-sm"
                />

                {/* Upload */}
                <label
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-white/20 rounded-lg px-3 py-2 cursor-pointer hover:border-[var(--accent-1)] hover:bg-white/5 transition-all"
                >
                  {uploadingImages[index] ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin text-[var(--accent-1)]" />
                      <span className="text-xs text-zinc-400">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs text-zinc-400">Upload / Drag & Drop Image</span>
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

        {/* Colors */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Colors (press Enter to add)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {colors.map((color) => (
              <span
                key={color}
                className="flex items-center gap-1.5 text-xs bg-[var(--accent-1)]/10 text-[var(--accent-1)] px-3 py-1.5 rounded-lg font-medium"
              >
                {color}
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            onKeyDown={handleColorKeyDown}
            placeholder="Type a color and press Enter..."
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors text-sm"
          />
        </div>

        {/* Sizes */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Sizes (press Enter to add)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {sizes.map((size) => (
              <span
                key={size}
                className="flex items-center gap-1.5 text-xs bg-[#c9a227]/10 text-[#c9a227] px-3 py-1.5 rounded-lg font-medium"
              >
                {size}
                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  className="hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={handleSizeKeyDown}
            placeholder="Type a size and press Enter..."
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors text-sm"
          />
        </div>

        {/* isNew toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isNew ? "bg-[var(--accent-1)]" : "bg-zinc-800"
            }`}
            onClick={() => setIsNew(!isNew)}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${
                isNew ? "translate-x-5" : ""
              }`}
            />
          </div>
          <span className="text-sm text-zinc-300">Mark as New Arrival</span>
        </label>

        {/* isTrending toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isTrending ? "bg-[var(--accent-1)]" : "bg-zinc-800"
            }`}
            onClick={() => setIsTrending(!isTrending)}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${
                isTrending ? "translate-x-5" : ""
              }`}
            />
          </div>
          <span className="text-sm text-zinc-300">Display on Trending List on Homepage</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-[var(--accent-1)] text-black font-black uppercase tracking-widest text-sm px-6 py-4 rounded-xl hover:brightness-110 transition-all"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </form>
    </motion.div>
  );
}

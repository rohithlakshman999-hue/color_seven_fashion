"use client";

import { useState, useEffect, useRef, KeyboardEvent, FormEvent, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, X, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useProducts } from "@/context/ProductContext";
import { Plus } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import {
  PRODUCT_CATEGORIES,
  getBrandsForProductCategory,
  brandOptionKey,
} from "@/lib/catalogHelpers";
import AdminSelect, { AdminSelectOption } from "@/components/AdminSelect";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { getProductById, updateProduct } = useProducts();
  const { brands: catalogBrands } = useCatalog();

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
  const initialLoadDone = useRef(false);

  useEffect(() => {
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
    setLoaded(true);
    initialLoadDone.current = true;
  }, [id, getProductById, catalogBrands]);

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
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validImages = images.map((i) => i.trim()).filter(Boolean);
    if (!name.trim() || !price || validImages.length === 0) return;

    const finalBrand = isCustomBrand ? customBrand.trim() : brand.trim();
    updateProduct(id, {
      name: name.trim(),
      brand: finalBrand || "Colour Seven",
      price: Number(price),
      category,
      images: validImages,
      description: description.trim(),
      sizes,
      colors,
      isNew,
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
              <AdminSelectOption optionKey={`cat-${cat}`} value={cat}>
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
              Image URLs * (up to 5)
            </label>
            {images.length < 5 && (
              <button
                type="button"
                onClick={addImageField}
                className="flex items-center gap-1 text-xs text-[var(--accent-1)] hover:underline"
              >
                <Plus className="w-3 h-3" />
                Add Image
              </button>
            )}
          </div>
          {images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={img}
                onChange={(e) => updateImage(i, e.target.value)}
                placeholder={`/images/product-${i + 1}.png`}
                className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-[var(--accent-1)] focus:outline-none transition-colors text-sm"
              />
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="p-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
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

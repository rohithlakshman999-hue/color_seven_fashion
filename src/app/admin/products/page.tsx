"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Brand, Category, Product, ProductImage } from "@/types/database";
import {
  Copy,
  Edit2,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

type ProductWithImages = Product & { product_images?: ProductImage[] };

type ImageFormRow = {
  id?: string;
  image_url: string;
  thumbnail_url: string;
  hover_image_url: string;
  video_url: string;
  display_order: number;
  is_main: boolean;
  file?: File | null;
};

type ProductForm = {
  category_id: string;
  brand_id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  sku: string;
  tags: string;
  original_price: string;
  discount_price: string;
  offer_percentage: string;
  tax: string;
  gender: string;
  product_type: string;
  collection: string;
  featured: boolean;
  is_active: boolean;
};

const emptyProductForm: ProductForm = {
  category_id: "",
  brand_id: "",
  name: "",
  slug: "",
  short_description: "",
  full_description: "",
  sku: "",
  tags: "",
  original_price: "",
  discount_price: "",
  offer_percentage: "0",
  tax: "0",
  gender: "unisex",
  product_type: "",
  collection: "",
  featured: false,
  is_active: true,
};

const newImageRow = (order = 0): ImageFormRow => ({
  image_url: "",
  thumbnail_url: "",
  hover_image_url: "",
  video_url: "",
  display_order: order,
  is_main: order === 0,
  file: null,
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message?: unknown }).message);
  }
  return fallback;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyProductForm);
  const [imageRows, setImageRows] = useState<ImageFormRow[]>([newImageRow()]);

  const categoryBrands = useMemo(
    () =>
      brands.filter((brand) => !form.category_id || brand.category_id === form.category_id),
    [brands, form.category_id]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [productsData, categoriesData, brandsData] = await Promise.all([
        supabase
          .from("products")
          .select("*, product_images(*)")
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("display_order"),
        supabase.from("brands").select("*").order("display_order"),
      ]);

      if (productsData.error) throw productsData.error;
      if (categoriesData.error) throw categoriesData.error;
      if (brandsData.error) throw brandsData.error;

      setProducts(productsData.data || []);
      setCategories(categoriesData.data || []);
      setBrands(brandsData.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const resetForm = () => {
    setEditingProductId(null);
    setForm(emptyProductForm);
    setImageRows([newImageRow()]);
    setFormOpen(false);
    setSuccess("");
    setError("");
  };

  const startCreate = () => {
    setEditingProductId(null);
    setForm(emptyProductForm);
    setImageRows([newImageRow()]);
    setFormOpen(true);
    setSuccess("");
    setError("");
  };

  const startEdit = (product: ProductWithImages) => {
    setEditingProductId(product.id);
    setForm({
      category_id: product.category_id,
      brand_id: product.brand_id,
      name: product.name,
      slug: product.slug,
      short_description: product.short_description || "",
      full_description: product.full_description || "",
      sku: product.sku,
      tags: product.tags?.join(", ") || "",
      original_price: String(product.original_price || ""),
      discount_price: String(product.discount_price || ""),
      offer_percentage: String(product.offer_percentage || 0),
      tax: String(product.tax || 0),
      gender: product.gender || "unisex",
      product_type: product.product_type || "",
      collection: product.collection || "",
      featured: product.featured,
      is_active: product.is_active,
    });
    const images = [...(product.product_images || [])].sort(
      (a, b) => a.display_order - b.display_order
    );
    setImageRows(
      images.length
        ? images.map((image, index) => ({
            id: image.id,
            image_url: image.image_url,
            thumbnail_url: image.thumbnail_url || image.image_url,
            hover_image_url: image.hover_image_url || "",
            video_url: image.video_url || "",
            display_order: image.display_order ?? index,
            is_main: image.is_main,
            file: null,
          }))
        : [newImageRow()]
    );
    setFormOpen(true);
    setSuccess("");
    setError("");
  };

  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "name" && (!current.slug || current.slug === slugify(current.name))) {
        next.slug = slugify(String(value));
      }
      if (key === "category_id") {
        next.brand_id = "";
      }
      return next;
    });
  };

  const updateImageRow = <K extends keyof ImageFormRow>(
    index: number,
    key: K,
    value: ImageFormRow[K]
  ) => {
    setImageRows((rows) =>
      rows.map((row, rowIndex) => {
        if (rowIndex !== index) return key === "is_main" && value ? { ...row, is_main: false } : row;
        return { ...row, [key]: value };
      })
    );
  };

  const addImageRow = () => {
    setImageRows((rows) => [...rows, newImageRow(rows.length)]);
  };

  const removeImageRow = (index: number) => {
    setImageRows((rows) => {
      const next = rows.filter((_, rowIndex) => rowIndex !== index);
      return next.length ? next.map((row, i) => ({ ...row, display_order: i })) : [newImageRow()];
    });
  };

  const uploadImage = async (file: File, productSlug: string) => {
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${productSlug}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!form.category_id || !form.brand_id) {
        throw new Error("Choose a category and brand before saving.");
      }

      const normalizedImages = await Promise.all(
        imageRows.map(async (row, index) => {
          const uploadedUrl = row.file ? await uploadImage(row.file, form.slug || slugify(form.name)) : "";
          const imageUrl = uploadedUrl || row.image_url.trim();

          return {
            image_url: imageUrl,
            thumbnail_url: row.thumbnail_url.trim() || imageUrl,
            hover_image_url: row.hover_image_url.trim() || null,
            video_url: row.video_url.trim() || null,
            display_order: index,
            is_main: row.is_main || index === 0,
          };
        })
      );

      const validImages = normalizedImages.filter((row) => row.image_url);
      if (!validImages.length) {
        throw new Error("Add at least one product image URL or upload an image file.");
      }

      const payload = {
        category_id: form.category_id,
        brand_id: form.brand_id,
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        short_description: form.short_description.trim(),
        full_description: form.full_description.trim(),
        sku: form.sku.trim(),
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        original_price: Number(form.original_price),
        discount_price: Number(form.discount_price),
        offer_percentage: Number(form.offer_percentage || 0),
        tax: Number(form.tax || 0),
        gender: form.gender || null,
        product_type: form.product_type.trim() || null,
        collection: form.collection.trim() || null,
        featured: form.featured,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      };

      if (!payload.name || !payload.slug || !payload.sku) {
        throw new Error("Name, slug, and SKU are required.");
      }
      if (!Number.isFinite(payload.original_price) || !Number.isFinite(payload.discount_price)) {
        throw new Error("Enter valid original and selling prices.");
      }

      const productResult = editingProductId
        ? await supabase
            .from("products")
            .update(payload)
            .eq("id", editingProductId)
            .select("id")
            .single()
        : await supabase.from("products").insert(payload).select("id").single();

      if (productResult.error) throw productResult.error;
      const productId = productResult.data.id;

      const { error: deleteImagesError } = await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId);
      if (deleteImagesError) throw deleteImagesError;

      const imagesPayload = validImages.map((row, index) => ({
        ...row,
        product_id: productId,
        is_main: row.is_main || index === 0,
      }));
      const { error: imageInsertError } = await supabase
        .from("product_images")
        .insert(imagesPayload);
      if (imageInsertError) throw imageInsertError;

      setSuccess(editingProductId ? "Product updated successfully." : "Product added successfully.");
      resetForm();
      await fetchData();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save product"));
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product and its images?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete product"));
    }
  };

  const duplicateProduct = async (product: ProductWithImages) => {
    try {
      const copySlug = `${product.slug}-${Date.now()}`;
      const { product_images: productImages, id, created_at, updated_at, ...productPayload } = product;
      void id;
      void created_at;
      void updated_at;
      const { data, error } = await supabase
        .from("products")
        .insert({
          ...productPayload,
          name: `${product.name} Copy`,
          slug: copySlug,
          sku: `${product.sku}-COPY-${Date.now().toString().slice(-4)}`,
        })
        .select("id")
        .single();

      if (error) throw error;

      if (productImages?.length) {
        const { error: imageError } = await supabase.from("product_images").insert(
          productImages.map((image) => ({
            product_id: data.id,
            image_url: image.image_url,
            thumbnail_url: image.thumbnail_url,
            hover_image_url: image.hover_image_url,
            video_url: image.video_url,
            display_order: image.display_order,
            is_main: image.is_main,
          }))
        );
        if (imageError) throw imageError;
      }

      await fetchData();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to duplicate product"));
    }
  };

  const filteredProducts = products.filter((product) => {
    if (selectedCategory && product.category_id !== selectedCategory) return false;
    if (selectedBrand && product.brand_id !== selectedBrand) return false;
    return true;
  });

  const getCategoryName = (id: string) => categories.find((category) => category.id === id)?.name;
  const getBrandName = (id: string) => brands.find((brand) => brand.id === id)?.name;

  if (loading) {
    return <div className="flex h-96 items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products Management</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Add product details and upload images directly to Supabase.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center justify-center gap-2 rounded bg-[#c9a227] px-4 py-2 text-sm font-bold text-black hover:bg-[#d4b239]"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {error && <div className="rounded border border-red-500 bg-red-500/10 p-4">{error}</div>}
      {success && <div className="rounded border border-green-500 bg-green-500/10 p-4">{success}</div>}

      {formOpen && (
        <form
          onSubmit={saveProduct}
          className="space-y-6 rounded-lg border border-white/10 bg-zinc-950 p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">
              {editingProductId ? "Edit Product" : "Add New Product"}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="rounded p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">Name</span>
              <input
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                required
                className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">Slug</span>
              <input
                value={form.slug}
                onChange={(event) => setField("slug", slugify(event.target.value))}
                required
                className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">Category</span>
              <select
                value={form.category_id}
                onChange={(event) => setField("category_id", event.target.value)}
                required
                className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">Brand</span>
              <select
                value={form.brand_id}
                onChange={(event) => setField("brand_id", event.target.value)}
                required
                className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
              >
                <option value="">Select brand</option>
                {categoryBrands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">SKU</span>
              <input
                value={form.sku}
                onChange={(event) => setField("sku", event.target.value)}
                required
                className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">Tags, comma separated</span>
              <input
                value={form.tags}
                onChange={(event) => setField("tags", event.target.value)}
                className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">Original Price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.original_price}
                onChange={(event) => setField("original_price", event.target.value)}
                required
                className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">Selling Price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.discount_price}
                onChange={(event) => setField("discount_price", event.target.value)}
                required
                className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">Offer %</span>
              <input
                type="number"
                min="0"
                value={form.offer_percentage}
                onChange={(event) => setField("offer_percentage", event.target.value)}
                className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">Tax %</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.tax}
                onChange={(event) => setField("tax", event.target.value)}
                className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">Gender</span>
              <select
                value={form.gender}
                onChange={(event) => setField("gender", event.target.value)}
                className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
              >
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">Product Type</span>
              <input
                value={form.product_type}
                onChange={(event) => setField("product_type", event.target.value)}
                className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-zinc-400">Collection</span>
              <input
                value={form.collection}
                onChange={(event) => setField("collection", event.target.value)}
                className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm">
            <span className="text-zinc-400">Short Description</span>
            <textarea
              value={form.short_description}
              onChange={(event) => setField("short_description", event.target.value)}
              rows={2}
              className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="text-zinc-400">Full Description</span>
            <textarea
              value={form.full_description}
              onChange={(event) => setField("full_description", event.target.value)}
              rows={4}
              className="w-full rounded border border-white/10 bg-black px-3 py-2 text-white"
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-bold">Product Images</h3>
              <button
                type="button"
                onClick={addImageRow}
                className="flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs font-bold text-[#c9a227] hover:bg-white/5"
              >
                <ImagePlus className="h-4 w-4" />
                Add Image
              </button>
            </div>

            {imageRows.map((row, index) => (
              <div
                key={`${row.id || "new"}-${index}`}
                className="grid grid-cols-1 gap-3 rounded border border-white/10 bg-black p-4 lg:grid-cols-[120px_1fr_1fr_1fr_auto]"
              >
                <div className="overflow-hidden rounded border border-white/10 bg-zinc-900">
                  {row.file ? (
                    <div className="flex aspect-square items-center justify-center p-3 text-center text-xs text-zinc-400">
                      {row.file.name}
                    </div>
                  ) : row.image_url ? (
                    <img src={row.image_url} alt="" className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center text-zinc-600">
                      <ImagePlus className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <label className="space-y-2 text-xs">
                  <span className="text-zinc-400">Image URL</span>
                  <input
                    value={row.image_url}
                    onChange={(event) => updateImageRow(index, "image_url", event.target.value)}
                    placeholder="https://..."
                    className="w-full rounded border border-white/10 bg-zinc-950 px-3 py-2 text-white"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      updateImageRow(index, "file", event.target.files?.[0] || null)
                    }
                    className="w-full text-xs text-zinc-400 file:mr-3 file:rounded file:border-0 file:bg-[#c9a227] file:px-3 file:py-2 file:text-xs file:font-bold file:text-black"
                  />
                </label>
                <label className="space-y-2 text-xs">
                  <span className="text-zinc-400">Thumbnail URL</span>
                  <input
                    value={row.thumbnail_url}
                    onChange={(event) => updateImageRow(index, "thumbnail_url", event.target.value)}
                    placeholder="Defaults to image URL"
                    className="w-full rounded border border-white/10 bg-zinc-950 px-3 py-2 text-white"
                  />
                </label>
                <label className="space-y-2 text-xs">
                  <span className="text-zinc-400">Hover/Video URLs</span>
                  <input
                    value={row.hover_image_url}
                    onChange={(event) => updateImageRow(index, "hover_image_url", event.target.value)}
                    placeholder="Hover image URL"
                    className="mb-2 w-full rounded border border-white/10 bg-zinc-950 px-3 py-2 text-white"
                  />
                  <input
                    value={row.video_url}
                    onChange={(event) => updateImageRow(index, "video_url", event.target.value)}
                    placeholder="Video URL"
                    className="w-full rounded border border-white/10 bg-zinc-950 px-3 py-2 text-white"
                  />
                </label>
                <div className="flex flex-row items-center gap-3 lg:flex-col lg:items-end">
                  <label className="flex items-center gap-2 text-xs text-zinc-300">
                    <input
                      type="radio"
                      checked={row.is_main}
                      onChange={() => updateImageRow(index, "is_main", true)}
                    />
                    Main
                  </label>
                  <button
                    type="button"
                    onClick={() => removeImageRow(index)}
                    className="rounded p-2 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => setField("featured", event.target.checked)}
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setField("is_active", event.target.checked)}
              />
              Active on website
            </label>
            <button
              type="submit"
              disabled={saving}
              className="ml-auto flex items-center gap-2 rounded bg-[#c9a227] px-5 py-2 text-sm font-bold text-black hover:bg-[#d4b239] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-4">
        <select
          value={selectedCategory}
          onChange={(event) => {
            setSelectedCategory(event.target.value);
            setSelectedBrand("");
          }}
          className="rounded border border-white/10 bg-zinc-900 px-4 py-2 text-white"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={selectedBrand}
          onChange={(event) => setSelectedBrand(event.target.value)}
          className="rounded border border-white/10 bg-zinc-900 px-4 py-2 text-white"
        >
          <option value="">All Brands</option>
          {brands
            .filter((brand) => !selectedCategory || brand.category_id === selectedCategory)
            .map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
        </select>

        <div className="py-2 text-sm text-zinc-500">Total: {filteredProducts.length} products</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-white/10">
          <thead className="border-b border-white/10 bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Brand</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-center">Images</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const mainImage =
                product.product_images?.find((image) => image.is_main) || product.product_images?.[0];

              return (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded bg-zinc-900">
                        {mainImage ? (
                          <img
                            src={mainImage.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-700">
                            <ImagePlus className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-zinc-500">{product.sku}</div>
                        <div className="text-xs text-zinc-600">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-400">{getCategoryName(product.category_id)}</td>
                  <td className="px-4 py-4 text-zinc-400">{getBrandName(product.brand_id)}</td>
                  <td className="px-4 py-4 text-right font-medium">
                    <div className="text-[#c9a227]">{currency.format(product.discount_price)}</div>
                    {product.original_price !== product.discount_price && (
                      <div className="text-xs text-zinc-500 line-through">
                        {currency.format(product.original_price)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-zinc-400">
                    {product.product_images?.length || 0}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                        product.is_active
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="rounded p-2 hover:bg-white/5"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4 text-[#c9a227]" />
                      </button>
                      <button
                        onClick={() => duplicateProduct(product)}
                        className="rounded p-2 hover:bg-white/5"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="rounded p-2 hover:bg-white/5"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

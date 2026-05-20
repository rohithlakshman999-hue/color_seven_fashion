"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product, Category, Brand } from "@/types/database";
import { Plus, Edit2, Trash2, Copy } from "lucide-react";
import Link from "next/link";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, brandsData] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*"),
        supabase.from("brands").select("*"),
      ]);

      if (productsData.error) throw productsData.error;
      if (categoriesData.error) throw categoriesData.error;
      if (brandsData.error) throw brandsData.error;

      setProducts(productsData.data || []);
      setCategories(categoriesData.data || []);
      setBrands(brandsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const duplicateProduct = async (product: Product) => {
    try {
      const { error } = await supabase.from("products").insert([
        {
          ...product,
          id: undefined,
          name: `${product.name} (Copy)`,
          slug: `${product.slug}-copy`,
          created_at: undefined,
          updated_at: undefined,
        },
      ]);
      if (error) throw error;
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate product");
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.category_id !== selectedCategory) return false;
    if (selectedBrand && p.brand_id !== selectedBrand) return false;
    return true;
  });

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name;
  const getBrandName = (id: string) => brands.find((b) => b.id === id)?.name;

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">Loading...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#c9a227] text-black rounded hover:bg-[#d4b239]"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500 rounded">{error}</div>}

      <div className="flex gap-4 flex-wrap">
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedBrand("");
          }}
          className="px-4 py-2 bg-zinc-900 border border-white/10 rounded text-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="px-4 py-2 bg-zinc-900 border border-white/10 rounded text-white"
        >
          <option value="">All Brands</option>
          {brands
            .filter((b) => !selectedCategory || b.category_id === selectedCategory)
            .map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
        </select>

        <div className="text-zinc-500 text-sm py-2">
          Total: {filteredProducts.length} products
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-white/10">
          <thead className="bg-zinc-900 border-b border-white/10">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Brand</th>
              <th className="px-6 py-3 text-right">Price</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-zinc-500">{product.sku}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-400">
                  {getCategoryName(product.category_id)}
                </td>
                <td className="px-6 py-4 text-zinc-400">
                  {getBrandName(product.brand_id)}
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  <div className="text-[#c9a227]">${product.discount_price}</div>
                  {product.original_price !== product.discount_price && (
                    <div className="text-xs text-zinc-500 line-through">
                      ${product.original_price}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      product.is_active
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="p-2 hover:bg-white/5 rounded"
                    >
                      <Edit2 className="w-4 h-4 text-[#c9a227]" />
                    </Link>
                    <button
                      onClick={() => duplicateProduct(product)}
                      className="p-2 hover:bg-white/5 rounded"
                    >
                      <Copy className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 hover:bg-white/5 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

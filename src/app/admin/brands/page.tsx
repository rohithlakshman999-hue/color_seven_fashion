"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Brand, Category } from "@/types/database";
import { Plus, Edit2, Trash2, Star } from "lucide-react";
import Link from "next/link";

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [brandsData, categoriesData] = await Promise.all([
        supabase.from("brands").select("*").order("display_order"),
        supabase.from("categories").select("*"),
      ]);

      if (brandsData.error) throw brandsData.error;
      if (categoriesData.error) throw categoriesData.error;

      setBrands(brandsData.data || []);
      setCategories(categoriesData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from("brands")
        .update({ featured: !featured })
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update brand");
    }
  };

  const deleteBrand = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from("brands").delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete brand");
    }
  };

  const filteredBrands = selectedCategory
    ? brands.filter((b) => b.category_id === selectedCategory)
    : brands;

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">Loading...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Brands Management</h1>
        <Link
          href="/admin/brands/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#c9a227] text-black rounded hover:bg-[#d4b239]"
        >
          <Plus className="w-5 h-5" />
          Add Brand
        </Link>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500 rounded">{error}</div>}

      <div className="flex gap-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-zinc-900 border border-white/10 rounded text-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <div className="text-zinc-500 text-sm py-2">
          Total: {filteredBrands.length} brands
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBrands.map((brand) => {
          const category = categories.find((c) => c.id === brand.category_id);
          return (
            <div
              key={brand.id}
              className="p-4 bg-zinc-900 border border-white/10 rounded-lg hover:border-[#c9a227]/40 transition-all"
            >
              <div className="aspect-square bg-black/50 rounded mb-3 overflow-hidden">
                {brand.logo && (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h3 className="font-bold text-lg mb-1">{brand.name}</h3>
              <p className="text-xs text-[#c9a227] mb-2">
                {category?.name}
              </p>
              <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                {brand.description}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => toggleFeatured(brand.id, brand.featured)}
                  className={`flex-1 flex items-center justify-center gap-1 text-xs py-1 rounded ${
                    brand.featured
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  <Star className="w-3 h-3" />
                  {brand.featured ? "Featured" : "Not Featured"}
                </button>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/brands/${brand.id}`}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-white/5 hover:bg-white/10 rounded text-xs"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => deleteBrand(brand.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-red-500/10 hover:bg-red-500/20 rounded text-xs text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

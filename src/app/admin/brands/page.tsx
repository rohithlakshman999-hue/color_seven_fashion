"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Brand, Category } from "@/types/database";
import {
  loadAdminCatalog,
  updateStoredBrand,
  deleteStoredBrand,
} from "@/lib/brandStorage";
import { Plus, Edit2, Trash2, Star, Tag } from "lucide-react";
import Link from "next/link";
import { brandOptionKey } from "@/lib/catalogHelpers";

function BrandCard({
  brand,
  categoryName,
  onToggleFeatured,
  onDelete,
}: {
  brand: Brand;
  categoryName?: string;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-4 bg-[#070707] border border-white/10 rounded-xl hover:border-[#c9a227]/50 transition-all">
      <div className="aspect-square bg-black/60 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
        {brand.logo ? (
          <img
            src={brand.logo}
            alt={brand.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        <div className="text-[#c9a227] text-3xl font-black">
          {brand.name.charAt(0)}
        </div>
      </div>
      <h3 className="font-black text-lg text-white mb-0.5 tracking-wide">
        {brand.name}
      </h3>
      {categoryName && (
        <p className="text-sm font-bold text-[#c9a227] mb-2 uppercase tracking-wide">
          {categoryName}
        </p>
      )}
      <p className="text-sm font-medium text-zinc-300 mb-3 line-clamp-2">
        {brand.description}
      </p>
      <button
        onClick={() => onToggleFeatured(brand.id, brand.featured)}
        className={`w-full flex items-center justify-center gap-1 text-xs py-2 rounded-lg font-bold mb-3 ${
          brand.featured
            ? "bg-yellow-500/20 text-yellow-300"
            : "bg-white/5 text-zinc-400"
        }`}
      >
        <Star className="w-3.5 h-3.5" />
        {brand.featured ? "Featured" : "Not Featured"}
      </button>
      <div className="flex gap-2">
        <Link
          href={`/admin/brands/${brand.id}`}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-[#c9a227]/20 hover:bg-[#c9a227]/30 rounded-lg text-xs font-bold text-[#c9a227]"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </Link>
        <button
          onClick={() => onDelete(brand.id)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-red-500/15 hover:bg-red-500/25 rounded-lg text-xs font-bold text-red-400"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}

function AdminBrandsContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");

  const refresh = () => {
    const { categories: cats, brands: brs } = loadAdminCatalog();
    setCategories(cats);
    setBrands(brs);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (categoryFilter && categories.length > 0) {
      const match = categories.find((c) => c.slug === categoryFilter);
      if (match) setSelectedCategory(match.id);
    }
  }, [categoryFilter, categories]);

  const toggleFeatured = (id: string, featured: boolean) => {
    updateStoredBrand(id, { featured: !featured });
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this brand?")) return;
    deleteStoredBrand(id);
    refresh();
  };

  const filteredBrands = selectedCategory
    ? brands.filter((b) => b.category_id === selectedCategory)
    : brands;

  const brandsByCategory = categories.map((cat) => ({
    category: cat,
    brands: brands.filter((b) => b.category_id === cat.id),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-zinc-400">
        Loading brands...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-serif text-white">
            Brands
          </h1>
          <p className="text-zinc-400 mt-1">
            {brands.length} brands across {categories.length} categories
          </p>
        </div>
        <Link
          href="/admin/brands/new"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#c9a227] text-black font-bold rounded-xl hover:bg-[#d4b239] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Brand
        </Link>
      </div>

      {/* Category summary — always show all categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((cat) => {
          const count = brands.filter((b) => b.category_id === cat.id).length;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                setSelectedCategory(isSelected ? "" : cat.id)
              }
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-[#c9a227] bg-[#c9a227]/15"
                  : "border-white/10 bg-[#070707] hover:border-[#c9a227]/40"
              }`}
            >
              <Tag className="w-4 h-4 text-[#c9a227] mb-2" />
              <p className="font-black text-white text-sm uppercase leading-tight">
                {cat.name}
              </p>
              <p className="text-xs font-bold text-[#c9a227] mt-1">
                {count} brands
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-zinc-900 border border-white/20 rounded-xl text-white font-bold focus:border-[#c9a227] focus:outline-none"
        >
          <option key="filter-all" value="">
            All Categories
          </option>
          {categories.map((cat) => (
            <option key={`filter-cat-${cat.id}`} value={cat.id}>
              {cat.name} ({brands.filter((b) => b.category_id === cat.id).length})
            </option>
          ))}
        </select>
        <p className="text-white font-bold">
          Showing {filteredBrands.length} brands
        </p>
      </div>

      {selectedCategory ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-[#c9a227] uppercase tracking-wide border-b border-white/10 pb-3">
            {categories.find((c) => c.id === selectedCategory)?.name} (
            {filteredBrands.length})
          </h2>
          {filteredBrands.length === 0 ? (
            <p className="text-zinc-400 font-medium">
              No brands in this category yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBrands.map((brand) => (
                <BrandCard
                  key={brandOptionKey(brand)}
                  brand={brand}
                  categoryName={
                    categories.find((c) => c.id === brand.category_id)?.name
                  }
                  onToggleFeatured={toggleFeatured}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {brandsByCategory.map((group) => (
            <div key={group.category.id} className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-black text-[#c9a227] uppercase tracking-wide border-b-2 border-[#c9a227]/30 pb-3">
                {group.category.name}
                <span className="text-white ml-2">
                  ({group.brands.length} brands)
                </span>
              </h2>
              {group.brands.length === 0 ? (
                <p className="text-zinc-400 font-medium pl-1">
                  No brands listed yet for {group.category.name}.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.brands.map((brand) => (
                    <BrandCard
                      key={brandOptionKey(brand)}
                      brand={brand}
                      onToggleFeatured={toggleFeatured}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminBrands() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96 text-zinc-400">
          Loading brands...
        </div>
      }
    >
      <AdminBrandsContent />
    </Suspense>
  );
}

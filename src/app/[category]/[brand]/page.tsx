"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useProducts } from "@/context/ProductContext";
import { useCatalog } from "@/context/CatalogContext";
import ProductCard from "@/components/ProductCard";

export default function BrandPage({
  params,
}: {
  params: Promise<{ category: string; brand: string }>;
}) {
  const { category: categorySlug, brand: brandSlug } = use(params);
  const { products, loaded: productsLoaded } = useProducts();
  const { categories, brands, loading: catalogLoading } = useCatalog();
  const [sortBy, setSortBy] = useState("newest");

  const category = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categories, categorySlug]
  );

  const brand = useMemo(
    () =>
      brands.find(
        (b) => b.slug === brandSlug && b.category_id === categorySlug
      ),
    [brands, brandSlug, categorySlug]
  );

  const brandProducts = useMemo(() => {
    if (!brand) return [];
    return products.filter((p) => p.brand === brand.name);
  }, [products, brand]);

  const sortedProducts = useMemo(() => {
    const list = [...brandProducts];
    if (sortBy === "price-low") return list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") return list.sort((a, b) => b.price - a.price);
    return list;
  }, [brandProducts, sortBy]);

  if (catalogLoading || !productsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!brand || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Not found</h1>
          <Link href="/shop" className="text-[#c9a227]">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-24">
      <div className="relative py-16 md:py-20 px-4 md:px-8 border-b border-white/5 mb-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#c9a227] text-sm tracking-widest uppercase font-black mb-2">
            {category.name}
          </p>
          <h1 className="text-5xl md:text-6xl font-bold">{brand.name}</h1>
          <p className="text-lg text-zinc-400 max-w-2xl mt-4">{brand.description}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mb-8 flex flex-col sm:flex-row justify-between gap-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-zinc-900 border border-white/20 rounded text-white text-sm font-bold"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
        <p className="text-sm text-zinc-500 self-end">
          {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-zinc-900/30 border border-white/5 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-2">No Products Available</h3>
            <p className="text-zinc-500">
              We don&apos;t have any products listed under {brand.name} at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

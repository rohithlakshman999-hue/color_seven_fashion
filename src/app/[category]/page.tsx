"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { brandOptionKey } from "@/lib/catalogHelpers";
import {
  getCategoryBySlug,
  getBrandsForCategorySlug,
} from "@/lib/brandStorage";
import { ArrowRight, Search } from "lucide-react";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const category = useMemo(
    () => getCategoryBySlug(params.slug),
    [params.slug]
  );

  const brands = useMemo(
    () => getBrandsForCategorySlug(params.slug),
    [params.slug]
  );

  const filteredBrands = useMemo(() => {
    if (!searchTerm.trim()) return brands;
    const q = searchTerm.toLowerCase();
    return brands.filter((brand) => brand.name.toLowerCase().includes(q));
  }, [brands, searchTerm]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Not found</h1>
          <p className="text-zinc-500">Category not found</p>
          <Link
            href="/shop"
            className="inline-block mt-4 px-6 py-2 border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227] hover:text-black transition-all"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-24">
      <div className="relative py-16 md:py-24 px-4 md:px-8 border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[rgba(201,162,39,0.08)] rounded-full filter blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-sm tracking-[0.3em] uppercase font-black text-[#c9a227] mb-4">
            EXPLORE
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif uppercase tracking-tight mb-6">
            {category.name}
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl">{category.description}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c9a227]/40"
          />
        </div>
        <p className="text-sm text-zinc-500 mt-2">
          Found {filteredBrands.length} brand
          {filteredBrands.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <Link
                key={brandOptionKey(brand)}
                href={`/${params.slug}/${brand.slug}`}
                className="group block h-full"
              >
                <div className="bg-zinc-900 border border-white/5 rounded-lg overflow-hidden hover:border-[#c9a227]/40 transition-colors duration-200 h-full flex flex-col">
                  <div className="relative h-48 bg-black/50 flex items-center justify-center">
                    <span className="text-4xl font-black text-[#c9a227]/40 group-hover:text-[#c9a227] transition-colors">
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-[#c9a227] transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-4 flex-1 line-clamp-2">
                      {brand.description}
                    </p>
                    {brand.featured && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs font-semibold mb-3 w-fit">
                        Featured
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#c9a227]">
                        View Collection
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#c9a227] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-zinc-500">
              {searchTerm
                ? `No brands found matching "${searchTerm}"`
                : "No brands available in this category yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

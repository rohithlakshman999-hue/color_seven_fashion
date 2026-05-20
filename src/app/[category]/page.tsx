"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Category, Brand, Product } from "@/types/database";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, [params.slug]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch category
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", params.slug)
        .single();

      if (catError) throw catError;
      setCategory(catData);

      if (catData) {
        // Fetch brands for this category
        const { data: brandsData, error: brandsError } = await supabase
          .from("brands")
          .select("*")
          .eq("category_id", catData.id)
          .eq("is_active", true)
          .order("display_order");

        if (brandsError) throw brandsError;
        setBrands(brandsData || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );

  if (error || !category)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-zinc-500">{error || "Category not found"}</p>
          <Link
            href="/shop"
            className="inline-block mt-4 px-6 py-2 border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227] hover:text-black transition-all"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative py-16 md:py-24 px-4 md:px-8 border-b border-white/5"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[rgba(201,162,39,0.08)] rounded-full filter blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-sm tracking-[0.3em] uppercase font-black text-[#c9a227] mb-4"
          >
            EXPLORE
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif uppercase tracking-tight mb-6"
          >
            {category.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-zinc-400 max-w-2xl"
          >
            {category.description}
          </motion.p>
        </div>
      </motion.div>

      {/* Search Section */}
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
          Found {filteredBrands.length} brand{filteredBrands.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Brands Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand, idx) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
              >
                <Link
                  href={`/${params.slug}/${brand.slug}`}
                  className="group block h-full"
                >
                  <div className="bg-zinc-900 border border-white/5 rounded-lg overflow-hidden hover:border-[#c9a227]/40 transition-all duration-500 h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="relative h-48 bg-black/50 overflow-hidden flex items-center justify-center">
                      {brand.logo && (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-[#c9a227] transition-colors">
                        {brand.name}
                      </h3>
                      <p className="text-zinc-400 text-sm mb-4 flex-1 line-clamp-2">
                        {brand.description}
                      </p>

                      {brand.featured && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs font-semibold mb-3">
                          ⭐ Featured
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#c9a227] group-hover:gap-2 transition-all">
                          View Collection
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#c9a227] group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
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

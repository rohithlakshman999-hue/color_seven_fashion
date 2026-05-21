"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductContext";
import { brandsByCategory } from "@/data/brands";
import { ArrowLeft, Watch, Search, SlidersHorizontal, Tag } from "lucide-react";

const BrandListButton = memo(function BrandListButton({
  name,
  count,
  isActive,
  onSelect,
}: {
  name: string;
  count: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors duration-150 flex items-center justify-between ${
        isActive
          ? "bg-[var(--accent-1)] text-black font-black"
          : "text-white font-bold hover:bg-[#c9a227]/15 hover:text-[#c9a227]"
      }`}
    >
      <span className="truncate">{name}</span>
      <span
        className={`text-[9px] px-2 py-0.5 rounded font-black shrink-0 ml-2 ${
          isActive
            ? "bg-black/15 text-black"
            : count > 0
            ? "bg-[var(--accent-1)] text-black"
            : "bg-[#c9a227]/25 text-[#c9a227]"
        }`}
      >
        {count}
      </span>
    </button>
  );
});

export default function WatchesPage() {
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  // Filter products to just watches
  const watchesProducts = useMemo(() => {
    return products.filter((p) => p.category === "Watches");
  }, [products]);

  // Static list of all 53 watch brands
  const watchBrands = useMemo(() => {
    return brandsByCategory.watches || [];
  }, []);

  // Compute product counts for each watch brand dynamically
  const brandProductCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    watchesProducts.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, [watchesProducts]);

  // Filter brands list based on search text input
  const filteredBrandsList = useMemo(() => {
    if (!searchQuery.trim()) return watchBrands;
    return watchBrands.filter((b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [watchBrands, searchQuery]);

  // Group watches by brand name
  const groupedWatches = useMemo(() => {
    const groups: Record<string, typeof watchesProducts> = {};
    watchesProducts.forEach((p) => {
      if (!groups[p.brand]) {
        groups[p.brand] = [];
      }
      groups[p.brand].push(p);
    });
    return groups;
  }, [watchesProducts]);

  // Distinct brand names that actually contain watches
  const activeBrands = useMemo(() => {
    return Object.keys(groupedWatches).sort();
  }, [groupedWatches]);

  return (
    <div className="min-h-screen bg-black text-white pt-16 pb-24">
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 overflow-hidden mb-12">
        <Image
          src="/images/chrono_watch.png"
          alt="Watches Banner"
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Watch className="w-5 h-5 text-[var(--accent-1)]" />
              <p className="text-[var(--accent-1)] text-[10px] tracking-[0.5em] uppercase font-black">
                COLOUR SEVEN WATCHES
              </p>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl uppercase tracking-widest skew-x-[-6deg]">
              TIMEPIECES
            </h1>
            <div className="h-[2px] w-20 bg-[var(--accent-1)] mx-auto mt-4 rounded-full" />
            <p className="text-zinc-500 text-xs tracking-[0.25em] uppercase font-bold mt-4">
              {watchesProducts.length} ITEMS AVAILABLE
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Back Link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[var(--accent-1)] transition-colors mb-10 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </Link>

        {/* Brand Explorer Sidebar & Product list grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT COLUMN: Brand Explorer Directory (Collapsible/Searchable) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#030303] border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[var(--accent-1)]" />
                  Brands Directory
                </h3>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-400 font-bold">
                  {watchBrands.length}
                </span>
              </div>

              {/* Search Brand Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search brand name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[var(--accent-1)] focus:outline-none transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Brands selection list */}
              <div className="max-h-[350px] lg:max-h-[500px] overflow-y-auto pr-1 space-y-1 scrollbar-thin">
                <button
                  onClick={() => setSelectedBrand(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                    selectedBrand === null
                      ? "bg-[var(--accent-1)] text-black"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>All Brands</span>
                  <span className={selectedBrand === null ? "text-black/60" : "text-zinc-600"}>
                    {watchesProducts.length}
                  </span>
                </button>

                {filteredBrandsList.map((b) => (
                  <BrandListButton
                    key={`watches-${b.name}`}
                    name={b.name}
                    count={brandProductCounts[b.name] || 0}
                    isActive={selectedBrand === b.name}
                    onSelect={() => setSelectedBrand(b.name)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Products Grid sorted by Brand Sections */}
          <div className="lg:col-span-3 space-y-12">
            <AnimatePresence mode="wait">
              {/* Case 1: Store is completely empty */}
              {watchesProducts.length === 0 ? (
                <motion.div
                  key="empty-store"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#030303] border border-white/5 rounded-2xl p-16 text-center"
                >
                  <Watch className="w-16 h-16 text-zinc-700 mx-auto mb-6 animate-pulse" />
                  <h2 className="text-xl font-black text-white uppercase tracking-widest mb-3">
                    No Watches Available
                  </h2>
                  <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed font-medium">
                    No products available at the moment. Please check back soon.
                  </p>
                </motion.div>
              ) : selectedBrand !== null ? (
                /* Case 2: A specific brand is selected */
                <motion.div
                  key={`brand-${selectedBrand}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2.5">
                      <Tag className="w-5 h-5 text-[var(--accent-1)]" />
                      {selectedBrand}
                    </h2>
                    <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">
                      {brandProductCounts[selectedBrand] || 0} timepieces listed
                    </p>
                  </div>

                  {(groupedWatches[selectedBrand] || []).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {groupedWatches[selectedBrand].map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#030303] border border-white/5 rounded-2xl p-12 text-center max-w-md mx-auto mt-6">
                      <Watch className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
                      <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">
                        No Products Available
                      </h3>
                      <p className="text-zinc-400 text-sm font-medium">
                        We don&apos;t have any products listed under{" "}
                        <span className="text-[#c9a227] font-bold">{selectedBrand}</span> at
                        the moment.
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* Case 3: "All Brands" is selected (render grouped sections for active brands) */
                <motion.div
                  key="all-brands"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12"
                >
                  {activeBrands.map((brandName) => {
                    const brandProducts = groupedWatches[brandName];
                    const brandInfo = watchBrands.find((b) => b.name === brandName);
                    return (
                      <div key={brandName} className="space-y-6">
                        {/* Section Header for each brand */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/5 pb-3">
                          <div>
                            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-[var(--accent-1)] flex items-center gap-2">
                              <span className="w-1.5 h-6 bg-[var(--accent-1)] rounded-full inline-block" />
                              {brandName}
                            </h2>
                            {brandInfo && (
                              <p className="text-zinc-500 text-xs mt-1">
                                {brandInfo.description}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 tracking-wider uppercase font-bold mt-1 sm:mt-0">
                            {brandProducts.length} Timepiece{brandProducts.length > 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Brand Section Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          {brandProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}

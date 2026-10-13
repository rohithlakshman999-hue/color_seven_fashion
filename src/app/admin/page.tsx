"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Watch,
  Footprints,
  Shirt,
  Gem,
  PlusCircle,
  ExternalLink,
  Tag,
  Layers,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import { useCatalog } from "@/context/CatalogContext";
import { brandOptionKey } from "@/lib/catalogHelpers";
import AnalyticsSummaryCards from "@/components/admin/AnalyticsSummaryCards";
import AnalyticsLineChart from "@/components/admin/AnalyticsLineChart";
import { AnalyticsDashboardData } from "@/types/analytics";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Watches: Watch,
  Shoes: Footprints,
  Clothes: Shirt,
  Accessories: Gem,
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const categoryIconBySlug: Record<string, React.ComponentType<{ className?: string }>> = {
  watches: Watch,
  shoes: Footprints,
  clothing: Shirt,
  clothes: Shirt,
  accessories: Gem,
};

export default function AdminDashboard() {
  const { products, loaded } = useProducts();
  const { categories: catalogCategories, brands: catalogBrands } = useCatalog();
  const [analytics, setAnalytics] = useState<AnalyticsDashboardData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics?range=7d")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.success && resData?.data) {
          setAnalytics(resData.data);
        }
      })
      .catch((err) => console.error("Admin analytics fetch error:", err))
      .finally(() => setAnalyticsLoading(false));
  }, []);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent-1)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const categoryCounts = {
    Watches: products.filter((p) => p.category === "Watches").length,
    Shoes: products.filter((p) => p.category === "Shoes").length,
    Clothing: products.filter((p) => p.category === "Clothing").length,
    Accessories: products.filter((p) => p.category === "Accessories").length,
  };

  const recentProducts = [...products].reverse().slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-serif">
          Dashboard
        </h1>
        <p className="text-zinc-500 mt-1">
          Welcome to the Colour Seven Admin Panel
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Products */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#070707] border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              Total Products
            </span>
            <Package className="w-4 h-4 text-[var(--accent-1)]" />
          </div>
          <p className="text-3xl font-black text-white">{products.length}</p>
        </motion.div>

        {/* Category Cards */}
        {(Object.entries(categoryCounts) as [string, number][]).map(
          ([cat, count], i) => {
            const Icon = categoryIcons[cat] || Package;
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="bg-[#070707] border border-white/5 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                    {cat}
                  </span>
                  <Icon className="w-4 h-4 text-[#c9a227]" />
                </div>
                <p className="text-3xl font-black text-white">{count}</p>
              </motion.div>
            );
          }
        )}
      </div>

      {/* Website Visitor Analytics Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--accent-1)]" />
            <h2 className="text-lg font-black text-white uppercase tracking-wide">
              Website Visitor Analytics
            </h2>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Traffic
            </span>
          </div>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-1 text-xs font-bold text-[var(--accent-1)] hover:underline uppercase tracking-wider"
          >
            <span>Full Analytics Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5 KPI Cards */}
        {analytics?.summary && (
          <AnalyticsSummaryCards
            summary={analytics.summary}
            isLoading={analyticsLoading}
          />
        )}

        {/* Chart Preview & Quick Top Pages */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <AnalyticsLineChart
                data={analytics.chartData}
                timeRange="7d"
                isLoading={analyticsLoading}
              />
            </div>
            <div className="bg-[#070707] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Top Visited Pages
                  </span>
                  <Link
                    href="/admin/analytics"
                    className="text-[10px] font-bold text-[#c9a227] hover:underline uppercase"
                  >
                    View All →
                  </Link>
                </div>
                {analytics.topPages.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-8 text-center">
                    No visitor records yet. As users browse the site, top pages will appear here.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {analytics.topPages.slice(0, 4).map((p) => (
                      <div
                        key={p.pathname}
                        className="p-2.5 rounded-xl bg-black border border-white/5 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {p.pathname}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {p.uniqueVisitors} visitors
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-[var(--accent-1)]">
                          {p.pageViews} views
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href="/admin/analytics"
                className="mt-4 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider text-center border border-white/10 transition-colors block"
              >
                Deep-Dive Analytics →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Catalog: Categories & Brands */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-lg font-black text-white uppercase tracking-wide">
            Categories & Brands
          </h2>
          <div className="flex gap-3">
            <Link
              href="/admin/categories"
              className="text-xs font-bold text-[#c9a227] hover:underline uppercase tracking-wider"
            >
              Manage Categories →
            </Link>
            <Link
              href="/admin/brands"
              className="text-xs font-bold text-[#c9a227] hover:underline uppercase tracking-wider"
            >
              Manage Brands →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {catalogCategories.map((cat) => {
            const Icon = categoryIconBySlug[cat.slug] || Layers;
            const brandCount = catalogBrands.filter(
              (b) => b.category_id === cat.id
            ).length;
            return (
              <Link
                key={cat.id}
                href={`/admin/brands?category=${cat.slug}`}
                className="bg-[#070707] border border-white/10 rounded-xl p-4 hover:border-[#c9a227]/40 transition-all group"
              >
                <Icon className="w-4 h-4 text-[#c9a227] mb-2" />
                <p className="font-black text-white text-sm uppercase leading-tight group-hover:text-[#c9a227] transition-colors">
                  {cat.name}
                </p>
                <p className="text-xs font-bold text-[#c9a227] mt-1">
                  {brandCount} brands
                </p>
              </Link>
            );
          })}
        </div>

        {catalogBrands.length > 0 && (
          <div className="bg-[#070707] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-[#c9a227]" />
              <h3 className="font-black text-white uppercase text-sm tracking-wider">
                Featured Brands
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {catalogBrands
                .filter((b) => b.featured)
                .slice(0, 24)
                .map((b) => (
                  <span
                    key={brandOptionKey(b)}
                    className="px-3 py-1.5 rounded-lg bg-[#c9a227]/15 border border-[#c9a227]/30 text-sm font-bold text-white"
                  >
                    {b.name}
                  </span>
                ))}
              {catalogBrands.filter((b) => b.featured).length === 0 && (
                <p className="text-zinc-400 text-sm">
                  No featured brands yet. Mark brands as featured in Brands
                  management.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/products/add"
          className="group flex items-center gap-4 p-6 bg-[#070707] border border-white/5 rounded-2xl hover:border-[var(--accent-1)]/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-1)]/10 flex items-center justify-center group-hover:bg-[var(--accent-1)]/20 transition-colors">
            <PlusCircle className="w-5 h-5 text-[var(--accent-1)]" />
          </div>
          <div>
            <h3 className="font-bold text-white">Add Product</h3>
            <p className="text-xs text-zinc-500">Create a new product listing</p>
          </div>
        </Link>
        <Link
          href="/"
          target="_blank"
          className="group flex items-center gap-4 p-6 bg-[#070707] border border-white/5 rounded-2xl hover:border-[#c9a227]/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#c9a227]/10 flex items-center justify-center group-hover:bg-[#c9a227]/20 transition-colors">
            <ExternalLink className="w-5 h-5 text-[#c9a227]" />
          </div>
          <div>
            <h3 className="font-bold text-white">View Store</h3>
            <p className="text-xs text-zinc-500">Open storefront in new tab</p>
          </div>
        </Link>
      </div>

      {/* Recent Products */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-white">Recent Products</h2>
        {recentProducts.length === 0 ? (
          <p className="text-zinc-500 text-sm">No products yet.</p>
        ) : (
          <div className="bg-[#070707] border border-white/5 rounded-2xl overflow-hidden">
            {recentProducts.map((product, i) => (
              <Link
                key={product.id}
                href={`/admin/products/edit/${product.id}`}
                className={`flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors ${
                  i < recentProducts.length - 1
                    ? "border-b border-white/5"
                    : ""
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {product.category} · {product.brand}
                  </p>
                </div>
                <span className="text-sm font-bold text-[var(--accent-1)]">
                  {currency.format(product.price)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

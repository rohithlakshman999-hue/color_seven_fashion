"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ShoppingBag,
  Tag,
  Layers,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalBrands: number;
  totalCategories: number;
  lowStockProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalBrands: 0,
    totalCategories: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [products, brands, categories, inventory] = await Promise.all([
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("brands").select("id", { count: "exact" }),
        supabase.from("categories").select("id", { count: "exact" }),
        supabase
          .from("inventory")
          .select("id", { count: "exact" })
          .lt("stock_quantity", "low_stock_threshold"),
      ]);

      setStats({
        totalProducts: products.count || 0,
        totalBrands: brands.count || 0,
        totalCategories: categories.count || 0,
        lowStockProducts: inventory.count || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    href,
  }: {
    icon: React.ComponentType<{ className: string }>;
    title: string;
    value: number;
    href: string;
  }) => (
    <Link
      href={href}
      className="p-6 bg-zinc-900 border border-white/10 rounded-lg hover:border-[#c9a227]/40 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-zinc-400 text-sm font-medium">{title}</h3>
        <Icon className="w-5 h-5 text-[#c9a227]" />
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </Link>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-zinc-500">Welcome to the Colour Seven Admin Panel</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={ShoppingBag}
              title="Total Products"
              value={stats.totalProducts}
              href="/admin/products"
            />
            <StatCard
              icon={Tag}
              title="Total Brands"
              value={stats.totalBrands}
              href="/admin/brands"
            />
            <StatCard
              icon={Layers}
              title="Total Categories"
              value={stats.totalCategories}
              href="/admin/categories"
            />
            <StatCard
              icon={AlertCircle}
              title="Low Stock Items"
              value={stats.lowStockProducts}
              href="/admin/inventory"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/products/new"
              className="p-8 bg-gradient-to-br from-[#c9a227]/20 to-black border border-[#c9a227]/30 rounded-lg hover:border-[#c9a227]/60 transition-all text-center"
            >
              <ShoppingBag className="w-8 h-8 text-[#c9a227] mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Add New Product</h3>
              <p className="text-zinc-500 text-sm">
                Create and upload new products to your store
              </p>
            </Link>

            <Link
              href="/admin/brands/new"
              className="p-8 bg-gradient-to-br from-[#c9a227]/20 to-black border border-[#c9a227]/30 rounded-lg hover:border-[#c9a227]/60 transition-all text-center"
            >
              <Tag className="w-8 h-8 text-[#c9a227] mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Add New Brand</h3>
              <p className="text-zinc-500 text-sm">
                Add brands to your categories
              </p>
            </Link>

            <Link
              href="/admin/categories/new"
              className="p-8 bg-gradient-to-br from-[#c9a227]/20 to-black border border-[#c9a227]/30 rounded-lg hover:border-[#c9a227]/60 transition-all text-center"
            >
              <Layers className="w-8 h-8 text-[#c9a227] mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Add New Category</h3>
              <p className="text-zinc-500 text-sm">
                Create new product categories
              </p>
            </Link>

            <Link
              href="/admin/inventory"
              className="p-8 bg-gradient-to-br from-[#c9a227]/20 to-black border border-[#c9a227]/30 rounded-lg hover:border-[#c9a227]/60 transition-all text-center"
            >
              <TrendingUp className="w-8 h-8 text-[#c9a227] mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Manage Inventory</h3>
              <p className="text-zinc-500 text-sm">
                Track and manage product stock
              </p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

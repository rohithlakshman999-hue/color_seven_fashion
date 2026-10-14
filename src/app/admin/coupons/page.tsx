"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TicketPercent,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  Check,
  RefreshCw,
  Copy,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Users,
  Clock,
  ArrowUpDown,
  Filter,
  DollarSign,
  Info,
} from "lucide-react";
import type { DiscountCoupon, CouponUsage } from "@/types/database";
import { useProducts } from "@/context/ProductContext";
import Link from "next/link";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function AdminCouponsPage() {
  const { products } = useProducts();

  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalUsages: 0,
    totalDiscountGiven: 0,
  });
  const [isDatabaseTableReady, setIsDatabaseTableReady] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "expired" | "depleted">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest_discount" | "most_used">("newest");

  // Notifications / Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<DiscountCoupon | null>(null);
  const [deleteConfirmCoupon, setDeleteConfirmCoupon] = useState<DiscountCoupon | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Usages Modal
  const [usagesModalCoupon, setUsagesModalCoupon] = useState<DiscountCoupon | null>(null);
  const [couponUsages, setCouponUsages] = useState<CouponUsage[]>([]);
  const [usagesLoading, setUsagesLoading] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formAppliesTo, setFormAppliesTo] = useState<"entire_order" | "specific_product">("entire_order");
  const [formProductId, setFormProductId] = useState<string>("");
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | "">("");
  const [formDesiredPrice, setFormDesiredPrice] = useState<number | "">("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formExpiryDate, setFormExpiryDate] = useState("");
  const [formMaxUses, setFormMaxUses] = useState<number | "">("");
  const [formMaxUsesPerCustomer, setFormMaxUsesPerCustomer] = useState<number | "">("");
  const [formMinOrderAmount, setFormMinOrderAmount] = useState<number | "">("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons");
      const json = await res.json();
      if (json.success) {
        setCoupons(json.coupons || []);
        if (json.stats) {
          setStats(json.stats);
        }
        setIsDatabaseTableReady(Boolean(json.isDatabaseTableReady));
      } else {
        showToast(json.error || "Failed to load coupons", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to connect to coupons API", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Dynamic calculations for the creation modal
  const calcDiscount = useMemo(() => {
    const orig = typeof formOriginalPrice === "number" ? formOriginalPrice : 0;
    const desired = typeof formDesiredPrice === "number" ? formDesiredPrice : 0;
    if (orig <= 0 || desired < 0) {
      return { amount: 0, percentage: 0, isValid: false, warning: "" };
    }
    if (desired > orig) {
      return {
        amount: 0,
        percentage: 0,
        isValid: false,
        warning: "Desired selling price cannot be higher than original price.",
      };
    }
    if (desired === orig) {
      return {
        amount: 0,
        percentage: 0,
        isValid: false,
        warning: "Desired selling price equals original price (₹0 discount). Coupons must provide a discount.",
      };
    }
    const amount = Math.max(0, orig - desired);
    const percentage = Number(((amount / orig) * 100).toFixed(2));
    return {
      amount,
      percentage,
      isValid: true,
      warning: "",
    };
  }, [formOriginalPrice, formDesiredPrice]);

  // Code generator helper
  const handleGenerateCode = async () => {
    try {
      const orig = typeof formOriginalPrice === "number" ? formOriginalPrice : undefined;
      const desired = typeof formDesiredPrice === "number" ? formDesiredPrice : undefined;
      const query = new URLSearchParams();
      if (orig !== undefined) query.set("originalPrice", String(orig));
      if (desired !== undefined) query.set("desiredPrice", String(desired));

      const res = await fetch(`/api/admin/coupons/generate-code?${query.toString()}`);
      const json = await res.json();
      if (json.success && json.code) {
        setFormCode(json.code);
      } else {
        // Fallback generator
        const disc = orig && desired && orig > desired ? orig - desired : 500;
        setFormCode(`SAVE${disc}`);
      }
    } catch {
      setFormCode(`SAVE${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormName("");
    setFormCode("");
    setFormAppliesTo("entire_order");
    setFormProductId("");
    setFormOriginalPrice("");
    setFormDesiredPrice("");
    setFormStartDate("");
    setFormExpiryDate("");
    setFormMaxUses("");
    setFormMaxUsesPerCustomer("");
    setFormMinOrderAmount("");
    setFormIsActive(true);
    setFormError("");
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon: DiscountCoupon) => {
    setEditingCoupon(coupon);
    setFormName(coupon.name);
    setFormCode(coupon.code);
    setFormAppliesTo(coupon.applies_to);
    setFormProductId(coupon.product_id || "");
    setFormOriginalPrice(coupon.original_price);
    setFormDesiredPrice(coupon.desired_selling_price ?? coupon.desired_price);
    setFormStartDate(coupon.start_date ? coupon.start_date.slice(0, 16) : "");
    setFormExpiryDate(coupon.expiry_date ? coupon.expiry_date.slice(0, 16) : "");
    setFormMaxUses(coupon.max_uses !== null && coupon.max_uses !== undefined ? coupon.max_uses : "");
    setFormMaxUsesPerCustomer(
      coupon.max_uses_per_customer !== null && coupon.max_uses_per_customer !== undefined
        ? coupon.max_uses_per_customer
        : ""
    );
    const minAmt = coupon.min_order_amount ?? coupon.min_purchase_amount;
    setFormMinOrderAmount(
      minAmt !== null && minAmt !== undefined ? minAmt : ""
    );
    setFormIsActive(coupon.is_active);
    setFormError("");
    setIsCreateModalOpen(true);
  };

  // Auto-fill price when product changes
  const handleProductSelect = (productId: string) => {
    setFormProductId(productId);
    if (!productId) return;
    const matched = products.find((p) => p.id === productId);
    if (matched && matched.price) {
      setFormOriginalPrice(matched.price);
      if (typeof formDesiredPrice !== "number" || formDesiredPrice >= matched.price) {
        // suggest 15% off by default
        const suggestedDesired = Math.max(0, Math.round(matched.price * 0.85));
        setFormDesiredPrice(suggestedDesired);
      }
    }
  };

  // Save Coupon (Create or Edit)
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName.trim()) {
      setFormError("Please enter a coupon name or description.");
      return;
    }

    const cleanCode = formCode.trim().toUpperCase().replace(/\s+/g, "");
    if (!cleanCode) {
      setFormError("Please enter or generate a coupon code.");
      return;
    }

    if (typeof formOriginalPrice !== "number" || formOriginalPrice <= 0) {
      setFormError("Original price must be greater than zero.");
      return;
    }

    if (typeof formDesiredPrice !== "number" || formDesiredPrice < 0) {
      setFormError("Desired selling price must be greater than or equal to zero.");
      return;
    }

    if (formDesiredPrice > formOriginalPrice) {
      setFormError("Desired selling price cannot be higher than original price.");
      return;
    }

    if (formDesiredPrice === formOriginalPrice) {
      setFormError("Desired selling price equals original price (₹0 discount). Coupons must provide a discount.");
      return;
    }

    if (formAppliesTo === "specific_product" && !formProductId) {
      setFormError("Please select the specific product this coupon applies to.");
      return;
    }

    setActionLoading(true);
    try {
      const selectedProduct = products.find((p) => p.id === formProductId);

      const payload = {
        name: formName.trim(),
        code: cleanCode,
        applies_to: formAppliesTo,
        product_id: formAppliesTo === "specific_product" ? formProductId : null,
        product_title: formAppliesTo === "specific_product" ? selectedProduct?.name || null : null,
        original_price: Number(formOriginalPrice),
        desired_selling_price: Number(formDesiredPrice),
        start_date: formStartDate ? new Date(formStartDate).toISOString() : null,
        expiry_date: formExpiryDate ? new Date(formExpiryDate).toISOString() : null,
        max_uses: typeof formMaxUses === "number" && formMaxUses > 0 ? formMaxUses : null,
        max_uses_per_customer:
          typeof formMaxUsesPerCustomer === "number" && formMaxUsesPerCustomer > 0
            ? formMaxUsesPerCustomer
            : null,
        min_order_amount:
          typeof formMinOrderAmount === "number" && formMinOrderAmount > 0 ? formMinOrderAmount : null,
        is_active: formIsActive,
      };

      const url = editingCoupon ? `/api/admin/coupons/${editingCoupon.id}` : "/api/admin/coupons";
      const method = editingCoupon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error || "Failed to save coupon.");
        setActionLoading(false);
        return;
      }

      showToast(editingCoupon ? "Coupon updated successfully!" : "Coupon created successfully!", "success");
      setIsCreateModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      setFormError(err?.message || "An unexpected error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Active / Inactive
  const handleToggleStatus = async (coupon: DiscountCoupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Coupon ${coupon.code} is now ${!coupon.is_active ? "Active" : "Inactive"}`);
        fetchCoupons();
      } else {
        showToast(json.error || "Failed to toggle status", "error");
      }
    } catch {
      showToast("Error updating coupon status", "error");
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async () => {
    if (!deleteConfirmCoupon) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons/${deleteConfirmCoupon.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Coupon ${deleteConfirmCoupon.code} deleted successfully`);
        setDeleteConfirmCoupon(null);
        fetchCoupons();
      } else {
        showToast(json.error || "Failed to delete coupon", "error");
      }
    } catch {
      showToast("Error deleting coupon", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Copy Code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // View Usages
  const handleViewUsages = async (coupon: DiscountCoupon) => {
    setUsagesModalCoupon(coupon);
    setUsagesLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons/usages?couponId=${coupon.id}`);
      const json = await res.json();
      if (json.success) {
        setCouponUsages(json.usages || []);
      } else {
        setCouponUsages([]);
      }
    } catch {
      setCouponUsages([]);
    } finally {
      setUsagesLoading(false);
    }
  };

  // Helper to determine status label
  const getCouponStatus = (coupon: DiscountCoupon) => {
    const now = new Date();
    if (!coupon.is_active) {
      return { label: "Inactive", color: "bg-zinc-800 text-zinc-400 border-zinc-700" };
    }
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return { label: "Scheduled", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
    }
    if (coupon.expiry_date && new Date(coupon.expiry_date) < now) {
      return { label: "Expired", color: "bg-red-500/10 text-red-400 border-red-500/30" };
    }
    if (coupon.max_uses !== null && coupon.max_uses !== undefined && coupon.used_count >= coupon.max_uses) {
      return { label: "Depleted", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
    }
    return { label: "Active", color: "bg-[var(--accent-1)]/10 text-[var(--accent-1)] border-[var(--accent-1)]/30" };
  };

  // Filtered & Sorted Coupons
  const filteredCoupons = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = new Date();

    return coupons
      .filter((c) => {
        // Status filter
        if (statusFilter === "active") {
          const isExpired = c.expiry_date && new Date(c.expiry_date) < now;
          const isDepleted = c.max_uses !== null && c.max_uses !== undefined && c.used_count >= c.max_uses;
          if (!c.is_active || isExpired || isDepleted) return false;
        } else if (statusFilter === "inactive") {
          if (c.is_active) return false;
        } else if (statusFilter === "expired") {
          if (!c.expiry_date || new Date(c.expiry_date) >= now) return false;
        } else if (statusFilter === "depleted") {
          if (c.max_uses === null || c.max_uses === undefined || c.used_count < c.max_uses) return false;
        }

        // Search filter
        if (!q) return true;
        const prod = c.product_title || c.product_name;
        return (
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          (Boolean(prod) && prod!.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "highest_discount") {
          return b.discount_amount - a.discount_amount;
        }
        if (sortBy === "most_used") {
          return b.used_count - a.used_count;
        }
        return 0;
      });
  }, [coupons, search, statusFilter, sortBy]);

  const sqlSetupContent = `-- Execute this in Supabase SQL Editor:
-- 1. Create discount_coupons table
CREATE TABLE IF NOT EXISTS public.discount_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  applies_to TEXT NOT NULL DEFAULT 'entire_order',
  product_id TEXT,
  product_title TEXT,
  original_price NUMERIC(10,2) NOT NULL,
  desired_selling_price NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL,
  discount_percentage NUMERIC(6,2) NOT NULL,
  start_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  max_uses INT,
  max_uses_per_customer INT,
  used_count INT NOT NULL DEFAULT 0,
  min_order_amount NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create coupon_usages table
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES public.discount_coupons(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL,
  order_id TEXT,
  customer_ref TEXT,
  original_eligible_amount NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) NOT NULL,
  final_payable_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS & Permissive Policies
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Coupons" ON public.discount_coupons FOR SELECT USING (true);
CREATE POLICY "Admin All Coupons" ON public.discount_coupons FOR ALL USING (true);
CREATE POLICY "Public Insert Usages" ON public.coupon_usages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin All Usages" ON public.coupon_usages FOR ALL USING (true);`;

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-semibold ${
              toast.type === "success"
                ? "bg-zinc-950 border-emerald-500/50 text-emerald-400 shadow-emerald-950/40"
                : "bg-zinc-950 border-red-500/50 text-red-400 shadow-red-950/40"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-1)]/10 border border-[var(--accent-1)]/20 flex items-center justify-center">
              <TicketPercent className="w-5 h-5 text-[var(--accent-1)]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white font-serif">
                Discount Coupons
              </h1>
              <p className="text-zinc-500 text-xs md:text-sm">
                Dynamic coupon generator, custom pricing rules & usage tracking
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCoupons()}
            disabled={loading}
            className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Coupons"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[var(--accent-1)]" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-1)] hover:bg-[var(--accent-1)]/90 text-black font-black uppercase text-xs tracking-wider transition-all shadow-lg shadow-[var(--accent-1)]/15 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Database sync notification banner */}
      {!isDatabaseTableReady && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-amber-300">
            <Info className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              Coupons are currently running with zero-downtime local persistence. Run the Supabase SQL migration to sync directly to your cloud PostgreSQL database.
            </span>
          </div>
          <button
            onClick={() => setShowSqlModal(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-bold uppercase tracking-wider text-[11px] shrink-0 hover:bg-amber-300 transition-colors"
          >
            View SQL Setup
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#070707] border border-white/5 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Coupons</span>
            <TicketPercent className="w-4 h-4 text-[var(--accent-1)]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-white">{stats.totalCoupons}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Configured in store</p>
        </div>

        <div className="bg-[#070707] border border-white/5 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Codes</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-emerald-400">{stats.activeCoupons}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Ready for customer use</p>
        </div>

        <div className="bg-[#070707] border border-white/5 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Redemptions</span>
            <Users className="w-4 h-4 text-[#c9a227]" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-white">{stats.totalUsages}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Times applied at checkout</p>
        </div>

        <div className="bg-[#070707] border border-white/5 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Savings Given</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[var(--accent-1)]">
            {currency.format(stats.totalDiscountGiven)}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">Customer discounts saved</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#070707] border border-white/5 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, coupon name, or product..."
              className="w-full pl-10 pr-4 py-2 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--accent-1)] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-white/10 text-xs">
              {(["all", "active", "inactive", "expired", "depleted"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-bold text-[11px] transition-all ${
                    statusFilter === filter
                      ? "bg-[var(--accent-1)] text-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-xl border border-white/10 text-xs text-zinc-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white focus:outline-none text-[11px] font-bold capitalize cursor-pointer"
              >
                <option value="newest" className="bg-zinc-900 text-white">Newest First</option>
                <option value="oldest" className="bg-zinc-900 text-white">Oldest First</option>
                <option value="highest_discount" className="bg-zinc-900 text-white">Highest Discount</option>
                <option value="most_used" className="bg-zinc-900 text-white">Most Used</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table / Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#070707] border border-white/5 rounded-2xl">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--accent-1)] border-t-transparent rounded-full mb-3" />
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Loading discount coupons...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-20 bg-[#070707] border border-white/5 rounded-2xl p-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-zinc-500">
            <TicketPercent className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider mb-1">
            {coupons.length === 0 ? "No discount coupons created yet" : "No coupons match your filter"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
            {coupons.length === 0
              ? "Create your first dynamic discount coupon by specifying the original price and your desired selling price."
              : "Try adjusting your search query or status filter to view other coupons."}
          </p>
          {coupons.length === 0 && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-1)] text-black font-black uppercase text-xs tracking-wider hover:bg-[var(--accent-1)]/90 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create First Coupon</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#070707] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-zinc-400 uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                <tr>
                  <th className="py-4 px-5">Coupon Code</th>
                  <th className="py-4 px-5">Campaign / Name</th>
                  <th className="py-4 px-5">Target Scope</th>
                  <th className="py-4 px-5">Price Breakdown</th>
                  <th className="py-4 px-5">Discount Given</th>
                  <th className="py-4 px-5">Usage</th>
                  <th className="py-4 px-5">Validity</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  const isCopied = copiedCode === coupon.code;

                  return (
                    <tr
                      key={coupon.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Code */}
                      <td className="py-4 px-5 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[var(--accent-1)] tracking-wider bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-1 text-zinc-500 hover:text-white transition-colors"
                            title="Copy Code"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-4 px-5">
                        <p className="font-bold text-white text-sm">{coupon.name}</p>
                        {(coupon.min_order_amount ?? coupon.min_purchase_amount) ? (
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            Min order: {currency.format(coupon.min_order_amount ?? coupon.min_purchase_amount)}
                          </p>
                        ) : null}
                      </td>

                      {/* Scope */}
                      <td className="py-4 px-5">
                        {coupon.applies_to === "entire_order" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 text-zinc-300 text-[11px] font-semibold">
                            <Layers className="w-3 h-3 text-zinc-500" />
                            Entire Order
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-[11px] font-semibold border border-blue-500/20 max-w-[160px] truncate">
                            <ShoppingBag className="w-3 h-3 text-blue-400 shrink-0" />
                            <span className="truncate">{coupon.product_title || coupon.product_name || "Specific Product"}</span>
                          </span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="text-zinc-500 flex items-center gap-1.5">
                            <span>Original:</span>
                            <span className="line-through text-zinc-400">
                              {currency.format(coupon.original_price)}
                            </span>
                          </div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>Selling:</span>
                            <span className="text-[var(--accent-1)]">
                              {currency.format(coupon.desired_selling_price ?? coupon.desired_price)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Discount Amount & Percentage */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-black text-emerald-400 text-sm">
                            −{currency.format(coupon.discount_amount)}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-bold">
                            ({coupon.discount_percentage}% OFF)
                          </span>
                        </div>
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-5">
                        <button
                          onClick={() => handleViewUsages(coupon)}
                          className="group/u text-left cursor-pointer hover:opacity-80 transition-opacity"
                          title="Click to view redemption history"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-white text-xs group-hover/u:text-[var(--accent-1)]">
                            <Users className="w-3.5 h-3.5 text-zinc-500 group-hover/u:text-[var(--accent-1)]" />
                            <span>
                              {coupon.used_count}
                              {coupon.max_uses !== null && coupon.max_uses !== undefined
                                ? ` / ${coupon.max_uses}`
                                : " used"}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 group-hover/u:underline">
                            View Log →
                          </span>
                        </button>
                      </td>

                      {/* Validity */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5 text-[10px] text-zinc-400">
                          {coupon.expiry_date ? (
                            <div className="flex items-center gap-1 text-zinc-300">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              <span>Exp: {new Date(coupon.expiry_date).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-500">No expiration</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active / Inactive */}
                          <button
                            onClick={() => handleToggleStatus(coupon)}
                            className={`p-2 rounded-lg border transition-colors ${
                              coupon.is_active
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                            }`}
                            title={coupon.is_active ? "Deactivate Coupon" : "Activate Coupon"}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:border-white/30 transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmCoupon(coupon)}
                            className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* CREATE / EDIT COUPON MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-[#090909] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--accent-1)]/10 border border-[var(--accent-1)]/20 flex items-center justify-center">
                    <TicketPercent className="w-5 h-5 text-[var(--accent-1)]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-white font-serif">
                      {editingCoupon ? "Edit Discount Coupon" : "Create Dynamic Coupon"}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Enter original price & desired selling price for real-time discount calculation
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveCoupon} className="space-y-6 pt-5">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Coupon Name or Description <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g., Diwali Festive Flash Sale, First Order Welcome"
                      className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent-1)]"
                    />
                  </div>

                  {/* Applicability Scope */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Eligible Products / Scope <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFormAppliesTo("entire_order");
                          setFormProductId("");
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                          formAppliesTo === "entire_order"
                            ? "bg-[var(--accent-1)]/10 border-[var(--accent-1)] text-white"
                            : "bg-black border-white/10 text-zinc-400 hover:border-white/20"
                        }`}
                      >
                        <Layers className={`w-4 h-4 ${formAppliesTo === "entire_order" ? "text-[var(--accent-1)]" : "text-zinc-500"}`} />
                        <div>
                          <p className="text-xs font-bold text-white">Entire Order</p>
                          <p className="text-[10px] text-zinc-500">Applies to total cart order</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormAppliesTo("specific_product")}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                          formAppliesTo === "specific_product"
                            ? "bg-[var(--accent-1)]/10 border-[var(--accent-1)] text-white"
                            : "bg-black border-white/10 text-zinc-400 hover:border-white/20"
                        }`}
                      >
                        <ShoppingBag className={`w-4 h-4 ${formAppliesTo === "specific_product" ? "text-[var(--accent-1)]" : "text-zinc-500"}`} />
                        <div>
                          <p className="text-xs font-bold text-white">Specific Product</p>
                          <p className="text-[10px] text-zinc-500">Only discounts a chosen product</p>
                        </div>
                      </button>
                    </div>

                    {/* Specific Product Dropdown */}
                    {formAppliesTo === "specific_product" && (
                      <div className="pt-2">
                        <select
                          value={formProductId}
                          onChange={(e) => handleProductSelect(e.target.value)}
                          className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[var(--accent-1)]"
                        >
                          <option value="">-- Select an eligible product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({currency.format(p.price)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Pricing & Real-Time Calculation */}
                <div className="p-4 rounded-2xl bg-black border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--accent-1)]">
                    <Sparkles className="w-4 h-4" />
                    <span>Dynamic Pricing & Discount Engine</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Original Price (₹) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={formOriginalPrice}
                        onChange={(e) =>
                          setFormOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="e.g., 4999"
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[var(--accent-1)]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Desired Final Selling Price (₹) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={formDesiredPrice}
                        onChange={(e) =>
                          setFormDesiredPrice(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="e.g., 3999"
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[var(--accent-1)]"
                      />
                    </div>
                  </div>

                  {/* Warning message if prices are invalid */}
                  {calcDiscount.warning && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>{calcDiscount.warning}</span>
                    </div>
                  )}

                  {/* LIVE PREVIEW SUMMARY BOX */}
                  {calcDiscount.isValid && (
                    <div className="p-4 rounded-xl bg-[var(--accent-1)]/5 border border-[var(--accent-1)]/30 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-1)]">
                        Live Discount Summary
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase">Original Price</p>
                          <p className="font-bold text-white">{currency.format(formOriginalPrice as number)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase">Calculated Discount</p>
                          <p className="font-black text-emerald-400">
                            −{currency.format(calcDiscount.amount)} ({calcDiscount.percentage}%)
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase">Final Price</p>
                          <p className="font-black text-[var(--accent-1)]">
                            {currency.format(formDesiredPrice as number)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase">Proposed Code</p>
                          <p className="font-mono font-bold text-white">
                            {formCode || `SAVE${calcDiscount.amount}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Coupon Code Generation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Coupon Code <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-[11px] font-bold text-[var(--accent-1)] hover:underline flex items-center gap-1 uppercase"
                    >
                      <Sparkles className="w-3 h-3" />
                      Generate Code
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                      placeholder="e.g., SAVE1000 or FESTIVE20"
                      className="flex-1 px-4 py-2.5 bg-black border border-white/10 rounded-xl font-mono uppercase font-black text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent-1)] tracking-widest text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-colors uppercase"
                    >
                      Auto-Generate
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Codes are automatically normalized into uppercase without spaces.
                  </p>
                </div>

                {/* Section 4: Optional Settings (Dates, Limits, Thresholds) */}
                <div className="space-y-4 pt-2 border-t border-white/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Optional Usage & Validity Settings
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        Start Date & Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full px-4 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[var(--accent-1)]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        Expiry Date & Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formExpiryDate}
                        onChange={(e) => setFormExpiryDate(e.target.value)}
                        className="w-full px-4 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[var(--accent-1)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Max Total Uses
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={formMaxUses}
                        onChange={(e) =>
                          setFormMaxUses(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="Unlimited if empty"
                        className="w-full px-4 py-2 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent-1)]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Max Uses / Customer
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={formMaxUsesPerCustomer}
                        onChange={(e) =>
                          setFormMaxUsesPerCustomer(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="e.g., 1"
                        className="w-full px-4 py-2 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent-1)]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Min Order Amount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formMinOrderAmount}
                        onChange={(e) =>
                          setFormMinOrderAmount(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="e.g., 2000"
                        className="w-full px-4 py-2 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent-1)]"
                      />
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-black text-[var(--accent-1)] focus:ring-[var(--accent-1)]"
                    />
                    <div>
                      <span className="text-xs font-bold text-white">Active Status</span>
                      <p className="text-[10px] text-zinc-500">
                        When active, customers can immediately apply this coupon at checkout.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !calcDiscount.isValid}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent-1)] hover:bg-[var(--accent-1)]/90 text-black font-black uppercase text-xs tracking-wider transition-all shadow-lg shadow-[var(--accent-1)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{editingCoupon ? "Update Coupon" : "Save & Activate Coupon"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USAGES HISTORY MODAL */}
      <AnimatePresence>
        {usagesModalCoupon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#090909] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl my-8 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#c9a227]/10 border border-[#c9a227]/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#c9a227]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight text-white font-serif">
                      Usage Tracking: {usagesModalCoupon.code}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Redeemed {usagesModalCoupon.used_count} time(s) • Total Savings:{" "}
                      {currency.format(usagesModalCoupon.used_count * usagesModalCoupon.discount_amount)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setUsagesModalCoupon(null)}
                  className="p-2 text-zinc-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                {usagesLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[var(--accent-1)] mb-2" />
                    <p className="text-xs text-zinc-500">Loading redemption logs...</p>
                  </div>
                ) : couponUsages.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">No redemptions yet</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      When customers apply this coupon during checkout, order details and savings will be tracked here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {couponUsages.map((usage) => (
                      <div
                        key={usage.id}
                        className="p-4 rounded-xl bg-black border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-white flex items-center gap-2">
                            <span>Order #{usage.order_id || "Direct"}</span>
                            {(usage.customer_ref || usage.customer_name || usage.customer_phone) && (
                              <span className="text-[10px] text-zinc-400 font-normal">
                                ({usage.customer_ref || usage.customer_name || usage.customer_phone})
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            {new Date(usage.created_at).toLocaleString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 uppercase block">Eligible / Paid</span>
                            <span className="text-zinc-300">
                              {currency.format(usage.original_eligible_amount ?? usage.original_amount)} →{" "}
                              <strong className="text-white font-bold">
                                {currency.format(usage.final_payable_amount ?? usage.final_amount)}
                              </strong>
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 uppercase block">Saved</span>
                            <span className="font-bold text-emerald-400">
                              −{currency.format(usage.discount_amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setUsagesModalCoupon(null)}
                  className="px-5 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs uppercase"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmCoupon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#090909] border border-white/10 rounded-3xl p-6 shadow-2xl text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
                <Trash2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-black uppercase text-white font-serif">
                  Delete Coupon?
                </h3>
                <p className="text-xs text-zinc-400 mt-2">
                  Are you sure you want to permanently delete coupon{" "}
                  <strong className="text-[var(--accent-1)] font-mono">
                    {deleteConfirmCoupon.code}
                  </strong>{" "}
                  ({deleteConfirmCoupon.name})? Customers will no longer be able to use it.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setDeleteConfirmCoupon(null)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleDeleteCoupon}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-900/30"
                >
                  {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Delete Permanently</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SQL SETUP MODAL */}
      <AnimatePresence>
        {showSqlModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#090909] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-black uppercase text-white font-serif">
                  Supabase SQL Setup for Coupons
                </h3>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="p-1.5 text-zinc-500 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-zinc-400">
                Copy and run this SQL script in your Supabase SQL Editor to enable cloud PostgreSQL tables for discount coupons and redemption logs:
              </p>

              <div className="relative flex-1 overflow-hidden rounded-xl bg-black border border-white/10">
                <pre className="p-4 text-[11px] font-mono text-zinc-300 h-64 overflow-y-auto whitespace-pre-wrap">
                  {sqlSetupContent}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sqlSetupContent);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-[var(--accent-1)] text-black font-bold text-xs flex items-center gap-1.5 shadow-lg"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? "Copied!" : "Copy SQL"}</span>
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-5 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs uppercase"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

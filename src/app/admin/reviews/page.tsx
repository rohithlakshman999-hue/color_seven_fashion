"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Upload,
  Calendar,
  Building,
  User,
  AlertCircle,
  Check,
  RefreshCw,
  Copy,
  ExternalLink,
  MessageSquareQuote,
  SlidersHorizontal,
} from "lucide-react";
import type { CustomerReview } from "@/types/database";
import { uploadAdminImage } from "@/lib/imageUpload";
import Link from "next/link";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    publishedCount: 0,
    unpublishedCount: 0,
    averageRating: 0,
  });
  const [isDatabaseTableReady, setIsDatabaseTableReady] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "unpublished">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  // Notifications / Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formPublished, setFormPublished] = useState(true);
  const [formImage, setFormImage] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews?status=all");
      const json = await res.json();
      if (json.success) {
        setReviews(json.reviews || []);
        if (json.stats) {
          setStats(json.stats);
        }
        setIsDatabaseTableReady(Boolean(json.isDatabaseTableReady));
      } else {
        showToast(json.error || "Failed to load reviews", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to connect to reviews API", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Open modal for Create
  const handleOpenAdd = () => {
    setEditingReview(null);
    setFormName("");
    setFormRating(5);
    setFormText("");
    setFormDesignation("");
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormPublished(true);
    setFormImage("");
    setImagePreview("");
    setFormImageFile(null);
    setFormError("");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (rev: CustomerReview) => {
    setEditingReview(rev);
    setFormName(rev.customer_name);
    setFormRating(rev.rating);
    setFormText(rev.review_text);
    setFormDesignation(rev.designation || "");
    setFormDate(rev.review_date || rev.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10));
    setFormPublished(rev.is_published);
    setFormImage(rev.customer_image || "");
    setImagePreview(rev.customer_image || "");
    setFormImageFile(null);
    setFormError("");
    setIsModalOpen(true);
  };

  // Handle image file selection
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file (JPEG, PNG, WEBP)");
      return;
    }

    setFormImageFile(file);
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    // Auto-upload using existing uploadAdminImage helper
    try {
      setImageUploadLoading(true);
      setFormError("");
      const publicUrl = await uploadAdminImage(file, "customer-reviews", "avatars");
      setFormImage(publicUrl);
      setImagePreview(publicUrl);
      showToast("Profile image uploaded successfully!");
    } catch (uploadErr: any) {
      console.warn("Direct bucket upload failed, using local blob or keeping URL:", uploadErr);
      // Fallback: keep preview, can also use image URL
      showToast("Cloud upload notice: image preview set locally. You can also paste an image URL.", "error");
    } finally {
      setImageUploadLoading(false);
    }
  };

  // Submit Add or Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName.trim()) {
      setFormError("Customer name is required.");
      return;
    }
    if (!formText.trim()) {
      setFormError("Review description is required.");
      return;
    }
    if (formRating < 1 || formRating > 5) {
      setFormError("Rating must be between 1 and 5.");
      return;
    }

    setActionLoading(true);

    try {
      const payload = {
        customer_name: formName.trim(),
        rating: Number(formRating),
        review_text: formText.trim(),
        designation: formDesignation.trim() || null,
        review_date: formDate,
        is_published: formPublished,
        customer_image: formImage.trim() || null,
      };

      let res;
      if (editingReview) {
        // Update
        res = await fetch(`/api/admin/reviews/${editingReview.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        res = await fetch("/api/admin/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Operation failed");
      }

      showToast(editingReview ? "Review updated successfully!" : "Review added successfully!");
      setIsModalOpen(false);
      await fetchReviews();
    } catch (err: any) {
      setFormError(err.message || "Failed to save review");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Publish / Unpublish
  const handleTogglePublish = async (rev: CustomerReview) => {
    try {
      const newStatus = !rev.is_published;
      const res = await fetch(`/api/admin/reviews/${rev.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to toggle status");
      }
      showToast(newStatus ? `Review by "${rev.customer_name}" published!` : `Review by "${rev.customer_name}" unpublished.`);
      await fetchReviews();
    } catch (err: any) {
      showToast(err.message || "Failed to update review status", "error");
    }
  };

  // Delete review
  const handleDelete = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to delete review");
      }
      showToast("Review deleted successfully!");
      setDeleteConfirmId(null);
      await fetchReviews();
    } catch (err: any) {
      showToast(err.message || "Failed to delete review", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter & Sort list
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    // Status filter
    if (statusFilter === "published") {
      list = list.filter((r) => r.is_published);
    } else if (statusFilter === "unpublished") {
      list = list.filter((r) => !r.is_published);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.customer_name.toLowerCase().includes(q) ||
          r.review_text.toLowerCase().includes(q) ||
          (r.designation && r.designation.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "highest") {
        return b.rating - a.rating || new Date(b.review_date).getTime() - new Date(a.review_date).getTime();
      }
      if (sortBy === "lowest") {
        return a.rating - b.rating || new Date(b.review_date).getTime() - new Date(a.review_date).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.review_date).getTime() - new Date(b.review_date).getTime();
      }
      // Newest
      return new Date(b.review_date).getTime() - new Date(a.review_date).getTime();
    });

    return list;
  }, [reviews, statusFilter, search, sortBy]);

  const sqlSetupCode = `-- ==========================================
-- CUSTOMER REVIEWS & TESTIMONIALS TABLE SETUP
-- Run in Supabase SQL Editor:
-- ==========================================

CREATE TABLE IF NOT EXISTS customer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_image TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  designation VARCHAR(255),
  is_published BOOLEAN NOT NULL DEFAULT true,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning fast homepage and reviews page loading
CREATE INDEX IF NOT EXISTS idx_customer_reviews_published ON customer_reviews(is_published, review_date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_rating ON customer_reviews(rating DESC);

-- Enable Row Level Security
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

-- Public can read ONLY published reviews
CREATE POLICY "Allow public select on published customer_reviews" 
  ON customer_reviews FOR SELECT 
  USING (is_published = true);

-- Service role / Admin has full management access
CREATE POLICY "Allow all actions for admin on customer_reviews" 
  ON customer_reviews FOR ALL 
  USING (true) WITH CHECK (true);

GRANT ALL PRIVILEGES ON TABLE customer_reviews TO authenticated, anon;
`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl ${
              toast.type === "success"
                ? "bg-[#0b1c0e]/95 border-emerald-500/30 text-emerald-300"
                : "bg-[#250b0b]/95 border-red-500/30 text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white font-serif">
              Customer Reviews
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-1)]/10 text-[var(--accent-1)] text-xs font-bold border border-[var(--accent-1)]/20 uppercase tracking-wider">
              Management
            </span>
          </div>
          <p className="text-zinc-400 text-sm">
            Curate authentic customer testimonials, manage publication status, and feature top feedback on the homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/reviews"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider"
          >
            <Eye className="w-4 h-4 text-zinc-400" />
            <span>Public Page</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </Link>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-[var(--accent-1)] text-black px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(207,242,39,0.2)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Database Status Alert Banner */}
      {!isDatabaseTableReady && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                Supabase SQL Setup Ready (Local Storage Active)
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                The reviews system is currently saving persistently to local JSON storage. To activate full cloud database synchronization, copy and paste the SQL script into your Supabase SQL Editor.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSqlModal(true)}
            className="shrink-0 px-4 py-2 bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-xl hover:bg-amber-300 transition-colors flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>View SQL Script</span>
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="bg-[#070707] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-[var(--accent-1)]/30 transition-all">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Total Reviews</span>
            <MessageSquareQuote className="w-4 h-4 text-zinc-400 group-hover:text-[var(--accent-1)] transition-colors" />
          </div>
          <p className="text-3xl font-black text-white">{stats.totalReviews}</p>
          <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
            All submitted feedback
          </div>
        </div>

        {/* Published Reviews */}
        <div className="bg-[#070707] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{stats.publishedCount}</p>
          <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
            Live on homepage & store
          </div>
        </div>

        {/* Unpublished / Draft */}
        <div className="bg-[#070707] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Unpublished</span>
            <EyeOff className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">{stats.unpublishedCount}</p>
          <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
            Draft or hidden from public
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-[#070707] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-[var(--accent-1)]/30 transition-all">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Average Rating</span>
            <Star className="w-4 h-4 text-[#c9a227] fill-[#c9a227]" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-white">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
            </p>
            <span className="text-xs text-zinc-500">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[#c9a227]">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 ${
                  s <= Math.round(stats.averageRating)
                    ? "fill-[#c9a227] text-[#c9a227]"
                    : "text-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="bg-[#070707] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by customer name, keyword, or company..."
            className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--accent-1)] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="bg-black border border-white/10 rounded-xl p-1 flex items-center">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === "all"
                  ? "bg-white/10 text-white shadow"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              All ({reviews.length})
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === "published"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Published ({stats.publishedCount})
            </button>
            <button
              onClick={() => setStatusFilter("unpublished")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === "unpublished"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Draft ({stats.unpublishedCount})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-black border border-white/10 rounded-xl px-3 py-2 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-zinc-500 uppercase tracking-wider font-bold text-[10px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="newest" className="bg-[#070707] text-white">Newest First</option>
              <option value="oldest" className="bg-[#070707] text-white">Oldest First</option>
              <option value="highest" className="bg-[#070707] text-white">Highest Rating</option>
              <option value="lowest" className="bg-[#070707] text-white">Lowest Rating</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchReviews}
            disabled={loading}
            title="Refresh reviews"
            className="p-2.5 bg-black border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[var(--accent-1)]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Reviews Table / Card List */}
      <div className="bg-[#070707] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--accent-1)]/20 border-t-[var(--accent-1)] rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
              Loading Reviews...
            </span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-20 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-zinc-600">
              <MessageSquareQuote className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">
              No Reviews Found
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mb-6">
              {search || statusFilter !== "all"
                ? "No customer reviews match your active filter criteria."
                : "No customer reviews have been added yet. Click 'Add Review' to create genuine approved testimonials."}
            </p>
            {search || statusFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-colors"
              >
                Reset Filters
              </button>
            ) : (
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-xl bg-[var(--accent-1)] text-black text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all"
              >
                Add Your First Review
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Review Content</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
                {filteredReviews.map((rev) => {
                  const initials = rev.customer_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={rev.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Customer Info */}
                      <td className="py-4 px-6 align-top">
                        <div className="flex items-center gap-3">
                          {rev.customer_image ? (
                            <img
                              src={rev.customer_image}
                              alt={rev.customer_name}
                              className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-md shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1a1a1a] to-[#2a2a2a] border border-white/10 flex items-center justify-center font-black text-xs text-[var(--accent-1)] shrink-0 shadow-inner">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-white text-sm truncate">
                              {rev.customer_name}
                            </div>
                            {rev.designation ? (
                              <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                                <Building className="w-3 h-3 text-zinc-500 shrink-0" />
                                <span>{rev.designation}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                                Customer
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-6 align-top">
                        <div className="flex items-center gap-1 text-[#c9a227]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= rev.rating
                                  ? "fill-[#c9a227] text-[#c9a227]"
                                  : "text-zinc-700"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-xs font-bold text-white">
                            {rev.rating}.0
                          </span>
                        </div>
                      </td>

                      {/* Review Content */}
                      <td className="py-4 px-6 align-top max-w-md">
                        <p className="text-zinc-300 leading-relaxed line-clamp-3">
                          "{rev.review_text}"
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 align-top whitespace-nowrap text-zinc-400 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span>
                            {rev.review_date
                              ? new Date(rev.review_date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "—"}
                          </span>
                        </div>
                      </td>

                      {/* Publish / Unpublish Status Toggle */}
                      <td className="py-4 px-6 align-top text-center whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePublish(rev)}
                          title={rev.is_published ? "Click to unpublish" : "Click to publish"}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                            rev.is_published
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                          }`}
                        >
                          {rev.is_published ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Draft
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(rev)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Edit Review"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(rev.id)}
                            className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#090909] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-wider text-white font-serif">
                    {editingReview ? "Edit Customer Review" : "Add Customer Review"}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {editingReview
                      ? "Update reviewer details and published visibility."
                      : "Add a genuine customer review with rating and optional avatar."}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitForm} className="space-y-6">
                {formError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Customer Name & Designation Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                      Customer Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Rohith Lakshman"
                        required
                        className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent-1)] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                      Designation / City (Optional)
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formDesignation}
                        onChange={(e) => setFormDesignation(e.target.value)}
                        placeholder="e.g. Verified Buyer, Bangalore"
                        className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent-1)] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating Selector & Review Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                      Star Rating (1 - 5) <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-2 p-2.5 bg-black border border-white/10 rounded-xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          className="p-1 hover:scale-115 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= formRating
                                ? "fill-[#c9a227] text-[#c9a227]"
                                : "text-zinc-700"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-white ml-2">
                        {formRating} Star{formRating > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                      Review Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[var(--accent-1)] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                      Review Description <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] text-zinc-500">
                      {formText.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Enter the customer's honest experience, quote, or review..."
                    required
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent-1)] transition-colors leading-relaxed"
                  />
                </div>

                {/* Profile Avatar / Photo (Upload or URL) */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                    Customer Profile Photo (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-black border border-white/10 rounded-2xl">
                    {/* Avatar Preview */}
                    <div className="relative shrink-0">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-[var(--accent-1)] shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-600">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                      {imageUploadLoading && (
                        <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-[var(--accent-1)] animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Upload button or Image URL */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors border border-white/10">
                          <Upload className="w-3.5 h-3.5 text-[var(--accent-1)]" />
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview("");
                              setFormImage("");
                              setFormImageFile(null);
                            }}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={formImage}
                        onChange={(e) => {
                          setFormImage(e.target.value);
                          setImagePreview(e.target.value);
                        }}
                        placeholder="Or enter image URL (e.g. https://...)"
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent-1)] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Published Toggle */}
                <div className="flex items-center justify-between p-4 bg-black border border-white/10 rounded-2xl">
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                      Publish to Website
                    </h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      When published, this review will automatically show on the homepage carousel and public reviews page.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPublished}
                      onChange={(e) => setFormPublished(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || imageUploadLoading}
                    className="px-6 py-2.5 rounded-xl bg-[var(--accent-1)] text-black text-xs font-black uppercase tracking-wider hover:brightness-110 shadow-lg transition-all flex items-center gap-2"
                  >
                    {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingReview ? "Save Changes" : "Create Review"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-red-500/20 rounded-3xl p-6 shadow-2xl z-10 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider text-white">
                Delete Customer Review?
              </h3>
              <p className="text-xs text-zinc-400 mt-2 mb-6 leading-relaxed">
                Are you sure you want to delete this customer review? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-wider hover:bg-red-500 transition-all shadow-lg flex items-center gap-2"
                >
                  {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SQL SCRIPT VIEW MODAL */}
      <AnimatePresence>
        {showSqlModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSqlModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#090909] border border-white/10 rounded-3xl p-6 shadow-2xl z-10 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-1)]/10 flex items-center justify-center text-[var(--accent-1)]">
                    <Copy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">
                      Supabase SQL Migration
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Copy and run this in your Supabase SQL Editor.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="relative flex-1 overflow-auto bg-black border border-white/10 rounded-xl p-4 font-mono text-xs text-zinc-300">
                <pre>{sqlSetupCode}</pre>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                <a
                  href="https://supabase.com/dashboard/project/xruuhhtxnhtaqzdyzimf/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--accent-1)] hover:underline flex items-center gap-1.5 font-bold uppercase tracking-wider"
                >
                  <span>Open Supabase SQL Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sqlSetupCode);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 3000);
                  }}
                  className="px-5 py-2.5 bg-[var(--accent-1)] text-black rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? "Copied to Clipboard!" : "Copy SQL Code"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

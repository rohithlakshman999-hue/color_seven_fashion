"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ShieldCheck,
  Building,
  Calendar,
  Search,
  SlidersHorizontal,
  ArrowLeft,
  Quote,
  MessageSquareQuote,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { CustomerReview } from "@/types/database";

const REVIEWS_PER_PAGE = 9;

export default function DedicatedReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalPublished, setTotalPublished] = useState(0);
  const [ratingCounts, setRatingCounts] = useState<{ [stars: number]: number }>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });

  // Filters & Controls
  const [search, setSearch] = useState("");
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

  useEffect(() => {
    async function fetchAllReviews() {
      try {
        setLoading(true);
        const res = await fetch("/api/reviews?sort=newest");
        const json = await res.json();
        if (json.success && Array.isArray(json.reviews)) {
          setReviews(json.reviews);
          setTotalPublished(json.total || json.reviews.length);
          setAverageRating(json.averageRating || 0);
          if (json.ratingCounts) {
            setRatingCounts(json.ratingCounts);
          }
        }
      } catch (err) {
        console.error("Failed to load customer reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllReviews();
  }, []);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    // Star rating filter
    if (selectedStarFilter !== "all") {
      list = list.filter((r) => Math.round(r.rating) === selectedStarFilter);
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.customer_name.toLowerCase().includes(q) ||
          r.review_text.toLowerCase().includes(q) ||
          (r.designation && r.designation.toLowerCase().includes(q))
      );
    }

    // Sorting
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
  }, [reviews, selectedStarFilter, search, sortBy]);

  const displayedReviews = useMemo(() => {
    return filteredReviews.slice(0, visibleCount);
  }, [filteredReviews, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + REVIEWS_PER_PAGE);
  };

  return (
    <div className="w-full bg-black text-white min-h-screen pb-28">
      {/* Hero Header Section */}
      <section className="relative py-20 px-4 md:px-8 bg-[#040404] border-b border-white/5 overflow-hidden">
        {/* Glow Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[rgba(207,242,39,0.06)] rounded-full filter blur-[140px] pointer-events-none" />

        <div className="container mx-auto relative z-10">
          {/* Breadcrumb / Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-[var(--accent-1)] uppercase tracking-wider transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-1)]/10 border border-[var(--accent-1)]/20 text-[var(--accent-1)] text-[10px] font-black uppercase tracking-widest mb-3">
                <Sparkles className="w-3 h-3" />
                <span>Genuine Customer Stories</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-serif">
                Customer Reviews
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                Explore real feedback and verified experiences from Colour Seven fashion enthusiasts across India.
              </p>
            </div>

            {/* Quick stats badge */}
            <div className="flex items-center gap-4 p-4 bg-[#080808] border border-white/10 rounded-2xl self-start md:self-end">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Overall Rating
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-white">
                    {averageRating > 0 ? averageRating.toFixed(1) : "5.0"}
                  </span>
                  <span className="text-xs text-zinc-500">/ 5.0</span>
                </div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Verified Reviews
                </span>
                <span className="text-2xl font-black text-[var(--accent-1)] mt-0.5">
                  {totalPublished}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-8 mt-12">
        {/* Rating Breakdown Summary Card */}
        <div className="bg-[#070707] border border-white/10 rounded-3xl p-6 sm:p-8 mb-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Score Box */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
              <span className="text-xs uppercase font-black tracking-widest text-[var(--accent-1)] mb-2">
                Customer Satisfaction
              </span>
              <div className="text-6xl font-black text-white font-serif tracking-tight">
                {averageRating > 0 ? averageRating.toFixed(1) : "5.0"}
              </div>
              <div className="flex items-center gap-1.5 text-[#c9a227] my-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating || 5)
                        ? "fill-[#c9a227] text-[#c9a227]"
                        : "text-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-400">
                Based on <span className="text-white font-bold">{totalPublished}</span> verified client feedback ratings
              </p>
            </div>

            {/* Right Interactive Star Breakdown Bars */}
            <div className="lg:col-span-8 space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts[star] || 0;
                const percent = totalPublished > 0 ? Math.round((count / totalPublished) * 100) : 0;
                const isSelected = selectedStarFilter === star;

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setSelectedStarFilter(isSelected ? "all" : star)
                    }
                    className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-white/10"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="w-12 text-xs font-bold text-zinc-300 flex items-center gap-1 shrink-0">
                      <span>{star}</span>
                      <Star className="w-3 h-3 fill-[#c9a227] text-[#c9a227]" />
                    </span>

                    {/* Progress Bar Track */}
                    <div className="flex-1 h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isSelected ? "bg-[var(--accent-1)]" : "bg-[#c9a227] group-hover:bg-[var(--accent-1)]"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <span className="w-16 text-right text-xs text-zinc-400 font-mono shrink-0">
                      {count} ({percent}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#070707] border border-white/10 rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews by keyword, customer name, or location..."
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

          {/* Controls: Star Pill Filters & Sort Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Star Filters */}
            <div className="flex items-center gap-1 bg-black border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setSelectedStarFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedStarFilter === "all"
                    ? "bg-white/10 text-white shadow"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                All
              </button>
              {[5, 4, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStarFilter(s)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    selectedStarFilter === s
                      ? "bg-[var(--accent-1)] text-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span>{s}</span>
                  <Star className="w-3 h-3 fill-current" />
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-black border border-white/10 rounded-xl px-3 py-2 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-500 uppercase tracking-wider font-bold text-[10px]">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
              >
                <option value="newest" className="bg-[#070707] text-white">Newest First</option>
                <option value="highest" className="bg-[#070707] text-white">Highest Rating</option>
                <option value="oldest" className="bg-[#070707] text-white">Oldest First</option>
                <option value="lowest" className="bg-[#070707] text-white">Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--accent-1)]/20 border-t-[var(--accent-1)] rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
              Loading Verified Reviews...
            </span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-20 px-4 bg-[#070707] border border-white/5 rounded-3xl text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-zinc-600">
              <MessageSquareQuote className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">
              No Reviews Found
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mb-6">
              {search || selectedStarFilter !== "all"
                ? "No published customer reviews match your active filter or search."
                : "No customer reviews have been published yet. Check back soon!"}
            </p>
            {(search || selectedStarFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedStarFilter("all");
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedReviews.map((review) => {
                const initials = review.customer_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#070707] border border-white/10 hover:border-[var(--accent-1)]/40 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_10px_35px_rgba(207,242,39,0.06)] group"
                  >
                    <div>
                      {/* Top: Stars & Quote */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-[#c9a227]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "fill-[#c9a227] text-[#c9a227]"
                                  : "text-zinc-700"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-xs font-bold text-white">
                            {review.rating}.0
                          </span>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 group-hover:text-[var(--accent-1)] group-hover:bg-[var(--accent-1)]/10 transition-colors">
                          <Quote className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Review text */}
                      <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                        "{review.review_text}"
                      </p>
                    </div>

                    {/* Bottom: Reviewer details */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {review.customer_image ? (
                          <img
                            src={review.customer_image}
                            alt={review.customer_name}
                            className="w-11 h-11 rounded-full object-cover border border-white/10 shrink-0 shadow-md"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#141414] to-[#252525] border border-white/10 flex items-center justify-center font-black text-xs text-[var(--accent-1)] shrink-0 shadow-inner">
                            {initials}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs sm:text-sm truncate">
                              {review.customer_name}
                            </span>
                            <span title="Verified Customer">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            </span>
                          </div>
                          {review.designation ? (
                            <p className="text-[10px] sm:text-xs text-zinc-500 truncate mt-0.5">
                              {review.designation}
                            </p>
                          ) : (
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">
                              Verified Buyer
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Review Date */}
                      {review.review_date && (
                        <div className="text-[10px] text-zinc-600 whitespace-nowrap shrink-0 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-600" />
                          <span>
                            {new Date(review.review_date).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredReviews.length && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3.5 bg-black border border-white/10 hover:border-[var(--accent-1)] rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:text-[var(--accent-1)] transition-all shadow-xl"
                >
                  Load More Reviews ({filteredReviews.length - visibleCount} Remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

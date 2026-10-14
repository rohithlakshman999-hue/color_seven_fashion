"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  ArrowRight,
  ShieldCheck,
  Building,
  Calendar,
  Sparkles,
  Play,
  Pause,
} from "lucide-react";
import type { CustomerReview } from "@/types/database";

export default function CustomerTestimonialsCarousel() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(5.0);
  const [totalCount, setTotalCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [motionReduced, setMotionReduced] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch published reviews from API
  useEffect(() => {
    let mounted = true;
    async function fetchReviews() {
      try {
        setLoading(true);
        const res = await fetch("/api/reviews?sort=newest&limit=20");
        const json = await res.json();
        if (mounted && json.success && Array.isArray(json.reviews)) {
          setReviews(json.reviews);
          setTotalCount(json.total || json.reviews.length);
          if (json.averageRating) {
            setAverageRating(json.averageRating);
          }
        }
      } catch (err) {
        console.warn("[CustomerTestimonials] Failed to fetch testimonials:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchReviews();

    // Check prefers-reduced-motion
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setMotionReduced(media.matches);
    }

    return () => {
      mounted = false;
    };
  }, []);

  const manualScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 380;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <section className="py-24 px-4 md:px-8 bg-black border-t border-white/5 relative overflow-hidden">
        <div className="container mx-auto">
          <div className="flex flex-col items-center mb-12">
            <div className="h-6 w-48 bg-white/5 rounded-full animate-pulse mb-3" />
            <div className="h-8 w-72 bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-[#070707] border border-white/5 rounded-3xl p-6 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  // Double the list for infinite seamless marquee loop
  const duplicatedReviews = reviews.length < 5 ? [...reviews, ...reviews, ...reviews] : [...reviews, ...reviews];

  return (
    <section
      className="py-24 bg-black border-t border-white/5 relative overflow-hidden select-none"
      aria-label="Customer Testimonials"
    >
      {/* Ambient Glow Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-[rgba(207,242,39,0.05)] rounded-full filter blur-[140px] pointer-events-none" />

      {/* Top Header Section */}
      <div className="container mx-auto px-4 md:px-8 relative z-10 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-1)]/10 border border-[var(--accent-1)]/20 text-[var(--accent-1)] text-[10px] font-black uppercase tracking-widest mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Verified Customer Feedback</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white font-serif flex items-center gap-3">
              <span>Client Voices</span>
              <span className="text-zinc-600 font-sans text-xl md:text-2xl font-light">/</span>
              <span className="text-[var(--accent-1)] text-xl md:text-2xl font-sans font-bold flex items-center gap-1.5">
                ★ {averageRating.toFixed(1)}
              </span>
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm mt-1 max-w-lg">
              Authentic verified testimonials from style connoisseurs across India who wear and experience Colour Seven.
            </p>
          </div>

          {/* Action Links & Controls */}
          <div className="flex items-center gap-4 self-start md:self-end">
            <Link
              href="/reviews"
              className="text-xs font-black tracking-widest text-zinc-300 hover:text-[var(--accent-1)] uppercase transition-colors flex items-center gap-1.5 mr-2"
            >
              <span>View All ({totalCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Play / Pause toggle */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Resume continuous movement" : "Pause continuous movement"}
              className="p-2.5 rounded-full border border-white/10 bg-[#070707] text-zinc-400 hover:text-white hover:border-[var(--accent-1)] transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-[var(--accent-1)]" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            {/* Manual Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => manualScroll("left")}
                aria-label="Previous testimonials"
                className="w-10 h-10 rounded-full border border-white/10 bg-[#070707] text-white hover:border-[var(--accent-1)] hover:text-[var(--accent-1)] transition-all flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => manualScroll("right")}
                aria-label="Next testimonials"
                className="w-10 h-10 rounded-full border border-white/10 bg-[#070707] text-white hover:border-[var(--accent-1)] hover:text-[var(--accent-1)] transition-all flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTINUOUS MOVING MARQUEE TRACK */}
      <div
        ref={scrollContainerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full overflow-x-hidden relative py-2"
      >
        {/* Left & Right subtle edge fade overlays */}
        <div className="absolute left-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

        <div
          className={`flex gap-6 ${motionReduced ? "" : "animate-testimonials-flow"}`}
          style={{
            animationPlayState: isPaused || isHovered ? "paused" : "running",
            width: "max-content",
          }}
        >
          {duplicatedReviews.map((review, idx) => {
            const initials = review.customer_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={`${review.id}-${idx}`}
                className="testimonial-card flex-shrink-0 w-[300px] sm:w-[360px] md:w-[400px] bg-[#070707] border border-white/10 hover:border-[var(--accent-1)]/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_10px_35px_rgba(207,242,39,0.08)] hover:-translate-y-1 group"
              >
                {/* Top: Stars & Quote Icon */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Stars */}
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
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 group-hover:text-[var(--accent-1)] group-hover:bg-[var(--accent-1)]/10 transition-colors">
                      <Quote className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed mb-6 font-normal line-clamp-4">
                    "{review.review_text}"
                  </p>
                </div>

                {/* Bottom: Reviewer Profile */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
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

                    {/* Name & Designation */}
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

                  {/* Date badge */}
                  {review.review_date && (
                    <span className="text-[10px] text-zinc-600 whitespace-nowrap shrink-0">
                      {new Date(review.review_date).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover & Pause Hint */}
      <div className="container mx-auto px-4 mt-6 text-center">
        <span className="text-[11px] text-zinc-600 tracking-wider uppercase font-medium">
          • Hover over any review to pause the flow •
        </span>
      </div>
    </section>
  );
}

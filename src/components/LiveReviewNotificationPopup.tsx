"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, CheckCircle2, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { CustomerReview } from "@/types/database";

export default function LiveReviewNotificationPopup() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Fetch published reviews
  useEffect(() => {
    let mounted = true;
    async function loadReviews() {
      try {
        const res = await fetch("/api/reviews?sort=newest&limit=10");
        const json = await res.json();
        if (mounted && json.success && Array.isArray(json.reviews) && json.reviews.length > 0) {
          setReviews(json.reviews);
        }
      } catch (err) {
        console.warn("[LiveReviewNotificationPopup] Error fetching reviews:", err);
      }
    }
    loadReviews();
    return () => {
      mounted = false;
    };
  }, []);

  // Cycle animation: appear, stay, disappear, advance, repeat
  useEffect(() => {
    if (reviews.length === 0 || isDismissed) return;

    // Initial delay before first appearance
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(initialTimer);
  }, [reviews.length, isDismissed]);

  useEffect(() => {
    if (!isVisible || isHovered || isDismissed || reviews.length === 0) return;

    // Display duration (6 seconds)
    const displayTimer = setTimeout(() => {
      setIsVisible(false);

      // Wait 3.5 seconds while hidden, then advance to next review and show
      const nextTimer = setTimeout(() => {
        if (!isDismissed) {
          setCurrentIndex((prev) => (prev + 1) % reviews.length);
          setIsVisible(true);
        }
      }, 3500);

      return () => clearTimeout(nextTimer);
    }, 6000);

    return () => clearTimeout(displayTimer);
  }, [isVisible, isHovered, isDismissed, reviews.length]);

  if (reviews.length === 0 || isDismissed) {
    return null;
  }

  const currentReview = reviews[currentIndex];
  if (!currentReview) return null;

  const initials = currentReview.customer_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-[340px] sm:max-w-[380px] select-none pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.92, x: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 35, scale: 0.95, x: -10 }}
            transition={{
              type: "spring",
              damping: 24,
              stiffness: 280,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="pointer-events-auto bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-[0_15px_45px_rgba(0,0,0,0.85),0_0_20px_rgba(207,242,39,0.06)] hover:border-[var(--accent-1)]/40 transition-colors duration-300 group"
          >
            {/* Top Row: Avatar, Name + Verified Badge, Close Button */}
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Avatar */}
                {currentReview.customer_image ? (
                  <img
                    src={currentReview.customer_image}
                    alt={currentReview.customer_name}
                    className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1b1b1b] to-[#2e2e2e] border border-white/10 flex items-center justify-center font-black text-[11px] text-[var(--accent-1)] shrink-0 shadow-inner">
                    {initials}
                  </div>
                )}

                {/* Name + Verified Checkmark */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs truncate">
                      {currentReview.customer_name}
                    </span>
                    <span title="Verified Buyer" className="text-sky-400 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-sky-400 text-black" />
                    </span>
                  </div>
                  {currentReview.designation && (
                    <span className="text-[10px] text-zinc-500 truncate block">
                      {currentReview.designation}
                    </span>
                  )}
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                  setIsDismissed(true);
                }}
                aria-label="Dismiss review notification"
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors -mr-1 -mt-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Review Quote Body */}
            <Link href="/reviews" className="block group-hover:text-zinc-200">
              <p className="text-zinc-300 text-xs leading-relaxed line-clamp-3 mb-3">
                "{currentReview.review_text}"
              </p>

              {/* Bottom Row: Google icon / Verified indicator + Date and Stars */}
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10">
                {/* Source & Date */}
                <div className="flex items-center gap-1.5 text-zinc-400">
                  {/* Google 'G' icon matching reference */}
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className="text-[10px] text-zinc-500">
                    {currentReview.review_date
                      ? new Date(currentReview.review_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Verified Buyer"}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 text-[#c9a227]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= currentReview.rating
                          ? "fill-[#c9a227] text-[#c9a227]"
                          : "text-zinc-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

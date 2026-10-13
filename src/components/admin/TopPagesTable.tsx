"use client";

import Link from "next/link";
import { TopPageStat } from "@/types/analytics";
import { ExternalLink, Layers, Eye, Users } from "lucide-react";

interface Props {
  pages: TopPageStat[];
  isLoading?: boolean;
}

function getPageName(path: string): string {
  if (path === "/") return "Homepage";
  if (path === "/shop") return "Shop / Catalog";
  if (path === "/about") return "About Us";
  if (path === "/contact") return "Contact Us";
  if (path === "/cart") return "Shopping Cart";
  if (path.startsWith("/products/")) return "Product Details";
  if (path.startsWith("/shop/")) return "Category Browse";
  return path;
}

export default function TopPagesTable({ pages, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-[#070707] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="h-6 w-40 bg-white/5 animate-pulse rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-white/5 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#070707] border border-white/10 rounded-2xl p-5 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#c9a227]" />
          <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider">
            Most Visited Pages
          </h2>
        </div>
        <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">
          Ranked by views
        </span>
      </div>

      {pages.length === 0 ? (
        <div className="py-10 text-center text-zinc-500 text-sm">
          No page view data recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((p, index) => {
            const pageName = getPageName(p.pathname);
            return (
              <div
                key={p.pathname}
                className="group relative p-3.5 bg-black border border-white/5 hover:border-white/20 rounded-xl transition-all"
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs font-mono font-bold text-zinc-400">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white group-hover:text-[var(--accent-1)] transition-colors truncate">
                          {p.pathname}
                        </p>
                        <Link
                          href={p.pathname}
                          target="_blank"
                          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition-opacity"
                          title="Open page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <p className="text-[11px] text-zinc-500">{pageName}</p>
                    </div>
                  </div>

                  {/* Views & Unique Visitors */}
                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-bold text-white">{p.uniqueVisitors}</span>
                      <span className="text-[10px] text-zinc-600 hidden sm:inline">visitors</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Eye className="w-3.5 h-3.5 text-[#c9a227]" />
                      <span className="font-bold text-white">{p.pageViews}</span>
                      <span className="text-[10px] text-zinc-600 hidden sm:inline">views</span>
                    </div>

                    <span className="w-12 text-right text-xs font-mono font-bold text-[var(--accent-1)]">
                      {p.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-1)] to-[#c9a227] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(2, p.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

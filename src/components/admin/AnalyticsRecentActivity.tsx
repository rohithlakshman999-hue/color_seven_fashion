"use client";

import { RecentVisitActivity } from "@/types/analytics";
import { Activity, Smartphone, Monitor, Tablet, ArrowUpRight } from "lucide-react";

interface Props {
  visits: RecentVisitActivity[];
  isLoading?: boolean;
}

export default function AnalyticsRecentActivity({ visits, isLoading }: Props) {
  const getDeviceIcon = (device: string) => {
    if (device === "mobile") return <Smartphone className="w-3.5 h-3.5 text-sky-400" />;
    if (device === "tablet") return <Tablet className="w-3.5 h-3.5 text-purple-400" />;
    return <Monitor className="w-3.5 h-3.5 text-zinc-400" />;
  };

  if (isLoading) {
    return (
      <div className="bg-[#070707] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="h-6 w-36 bg-white/5 animate-pulse rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-white/5 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#070707] border border-white/10 rounded-2xl p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider">
            Live Activity Feed
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Real-Time
          </span>
        </div>
      </div>

      {visits.length === 0 ? (
        <div className="py-8 text-center text-zinc-500 text-sm">
          No recent activity yet. As users browse the site, visits will appear here in real time.
        </div>
      ) : (
        <div className="divide-y divide-white/5 max-h-[360px] overflow-y-auto pr-1">
          {visits.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="p-1.5 rounded-lg bg-white/5 border border-white/5 shrink-0"
                  title={item.deviceType}
                >
                  {getDeviceIcon(item.deviceType)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate max-w-[200px] sm:max-w-[300px]">
                      {item.pathname}
                    </span>
                    {item.isNewVisitor ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--accent-1)]/10 text-[var(--accent-1)] border border-[var(--accent-1)]/20 shrink-0">
                        New
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/5 text-zinc-400 shrink-0">
                        Returning
                      </span>
                    )}
                  </div>
                  {item.referrer && (
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                      via {item.referrer.replace(/^https?:\/\//, "")}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-mono text-zinc-400 block">
                  {item.timeAgo}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-600 capitalize">
                  {item.deviceType}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

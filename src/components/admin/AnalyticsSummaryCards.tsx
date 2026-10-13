"use client";

import { motion } from "framer-motion";
import { Users, Eye, TrendingUp, Calendar, Globe } from "lucide-react";
import { AnalyticsSummaryCards as SummaryType } from "@/types/analytics";

interface Props {
  summary: SummaryType;
  isLoading?: boolean;
}

export default function AnalyticsSummaryCards({ summary, isLoading }: Props) {
  const cards = [
    {
      title: "Unique Visitors",
      period: "All-Time",
      value: summary.totalUniqueVisitors,
      sublabel: "Distinct individuals",
      icon: Users,
      accentColor: "text-[var(--accent-1)]",
      borderColor: "hover:border-[var(--accent-1)]/40",
      bgGlow: "from-[var(--accent-1)]/10 to-transparent",
    },
    {
      title: "Total Page Views",
      period: "All-Time",
      value: summary.totalPageViews,
      sublabel: "Total impressions",
      icon: Eye,
      accentColor: "text-[#c9a227]",
      borderColor: "hover:border-[#c9a227]/40",
      bgGlow: "from-[#c9a227]/10 to-transparent",
    },
    {
      title: "Visitors Today",
      period: "Today",
      value: summary.todayVisitors,
      sublabel: `${summary.todayPageViews} views today`,
      icon: TrendingUp,
      accentColor: "text-emerald-400",
      borderColor: "hover:border-emerald-500/40",
      bgGlow: "from-emerald-500/10 to-transparent",
    },
    {
      title: "Last 7 Days",
      period: "Past Week",
      value: summary.last7DaysVisitors,
      sublabel: `${summary.last7DaysPageViews} views (7d)`,
      icon: Calendar,
      accentColor: "text-sky-400",
      borderColor: "hover:border-sky-500/40",
      bgGlow: "from-sky-500/10 to-transparent",
    },
    {
      title: "Last 30 Days",
      period: "Past Month",
      value: summary.last30DaysVisitors,
      sublabel: `${summary.last30DaysPageViews} views (30d)`,
      icon: Globe,
      accentColor: "text-purple-400",
      borderColor: "hover:border-purple-500/40",
      bgGlow: "from-purple-500/10 to-transparent",
    },
  ];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`relative overflow-hidden bg-[#070707] border border-white/10 rounded-2xl p-5 transition-all duration-300 ${card.borderColor} group`}
          >
            {/* Ambient top gradient glow */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.bgGlow} opacity-60 group-hover:opacity-100 transition-opacity`}
            />

            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  {card.title}
                </span>
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-medium">
                  {card.period}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                <Icon className={`w-4 h-4 ${card.accentColor}`} />
              </div>
            </div>

            <div className="mt-2">
              {isLoading ? (
                <div className="h-8 w-24 bg-white/5 animate-pulse rounded-md" />
              ) : (
                <p className="text-3xl font-black text-white tracking-tight">
                  {formatNumber(card.value)}
                </p>
              )}
              <p className="text-[11px] text-zinc-500 mt-1.5 font-medium truncate">
                {card.sublabel}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

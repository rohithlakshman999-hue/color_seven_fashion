"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  RefreshCw,
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  Sparkles,
} from "lucide-react";
import AnalyticsSummaryCards from "@/components/admin/AnalyticsSummaryCards";
import AnalyticsLineChart from "@/components/admin/AnalyticsLineChart";
import TopPagesTable from "@/components/admin/TopPagesTable";
import AnalyticsRecentActivity from "@/components/admin/AnalyticsRecentActivity";
import DatabaseStatusBadge from "@/components/admin/DatabaseStatusBadge";
import { AnalyticsDashboardData, AnalyticsTimeRange } from "@/types/analytics";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [range, setRange] = useState<AnalyticsTimeRange>("7d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchAnalytics = useCallback(async (selectedRange: AnalyticsTimeRange, isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch(`/api/admin/analytics?range=${selectedRange}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(range);
  }, [range, fetchAnalytics]);

  // Auto-refresh interval (every 30 seconds if enabled)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchAnalytics(range, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, range, fetchAnalytics]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/admin/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      if (res.ok) {
        await fetchAnalytics(range, true);
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-[var(--accent-1)]" />
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-serif text-white">
                  Visitor Analytics
                </h1>
              </div>
              <p className="text-zinc-500 text-xs md:text-sm mt-0.5">
                Real-time traffic metrics, user trajectories, and page activity
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {data?.storageStatus && (
            <DatabaseStatusBadge
              status={data.storageStatus}
              onSync={handleSync}
              isSyncing={isSyncing}
            />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                autoRefresh
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-white/5 text-zinc-500 border-white/10"
              }`}
              title="Automatically refresh analytics every 30s"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  autoRefresh ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                }`}
              />
              Auto 30s
            </button>

            <button
              onClick={() => fetchAnalytics(range, false)}
              disabled={loading || refreshing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-1)] hover:brightness-110 text-black text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing || loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      {data?.summary && (
        <AnalyticsSummaryCards summary={data.summary} isLoading={loading} />
      )}

      {/* Main Trajectory Line Chart */}
      {data && (
        <AnalyticsLineChart
          data={data.chartData}
          timeRange={range}
          onRangeChange={(newRange) => setRange(newRange)}
          isLoading={loading}
        />
      )}

      {/* Device Breakdown Card */}
      {data?.devices && (
        <div className="bg-[#070707] border border-white/10 rounded-2xl p-5 md:p-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-white mb-4">
            Device Distribution
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-black border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <Monitor className="w-5 h-5 text-zinc-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase">Desktop</p>
                  <p className="text-[11px] text-zinc-500">{data.devices.desktop} visits</p>
                </div>
              </div>
              <span className="text-lg font-black text-white font-mono">
                {data.devices.desktopPercent}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-black border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10">
                  <Smartphone className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase">Mobile</p>
                  <p className="text-[11px] text-zinc-500">{data.devices.mobile} visits</p>
                </div>
              </div>
              <span className="text-lg font-black text-white font-mono">
                {data.devices.mobilePercent}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-black border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Tablet className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white uppercase">Tablet</p>
                  <p className="text-[11px] text-zinc-500">{data.devices.tablet} visits</p>
                </div>
              </div>
              <span className="text-lg font-black text-white font-mono">
                {data.devices.tabletPercent}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Grid: Most Visited Pages & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPagesTable pages={data?.topPages || []} isLoading={loading} />
        <AnalyticsRecentActivity
          visits={data?.recentVisits || []}
          isLoading={loading}
        />
      </div>
    </motion.div>
  );
}

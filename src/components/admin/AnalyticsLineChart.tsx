"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnalyticsChartPoint, AnalyticsTimeRange } from "@/types/analytics";
import { TrendingUp, Users, Eye, BarChart2 } from "lucide-react";

interface Props {
  data: AnalyticsChartPoint[];
  timeRange: AnalyticsTimeRange;
  onRangeChange?: (range: AnalyticsTimeRange) => void;
  isLoading?: boolean;
}

export default function AnalyticsLineChart({
  data,
  timeRange,
  onRangeChange,
  isLoading,
}: Props) {
  const [activeMetric, setActiveMetric] = useState<"both" | "visitors" | "views">("both");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };

  const chartInnerWidth = svgWidth - padding.left - padding.right;
  const chartInnerHeight = svgHeight - padding.top - padding.bottom;

  // Maximum value for scaling (min 5 to avoid flat charts on low data)
  const maxValue = useMemo(() => {
    let max = 5;
    data.forEach((p) => {
      if (p.visitors > max) max = p.visitors;
      if (p.pageViews > max) max = p.pageViews;
    });
    // Add 20% head-room
    return Math.ceil(max * 1.2);
  }, [data]);

  const totalVisitorsInRange = useMemo(
    () => data.reduce((acc, curr) => acc + curr.visitors, 0),
    [data]
  );
  const totalViewsInRange = useMemo(
    () => data.reduce((acc, curr) => acc + curr.pageViews, 0),
    [data]
  );

  // Generate SVG coordinates for each point
  const points = useMemo(() => {
    if (data.length === 0) return [];
    const step = data.length > 1 ? chartInnerWidth / (data.length - 1) : chartInnerWidth;

    return data.map((d, i) => {
      const x = padding.left + (data.length === 1 ? chartInnerWidth / 2 : i * step);
      const yVisitors = padding.top + chartInnerHeight - (d.visitors / maxValue) * chartInnerHeight;
      const yViews = padding.top + chartInnerHeight - (d.pageViews / maxValue) * chartInnerHeight;
      return { x, yVisitors, yViews, ...d };
    });
  }, [data, maxValue, chartInnerWidth, chartInnerHeight, padding]);

  // Generate SVG path for a metric
  const makePath = (key: "yVisitors" | "yViews"): string => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0][key]}`;

    // Smooth bezier curve generator
    let d = `M ${points[0].x} ${points[0][key]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx} ${p0[key]}, ${mx} ${p1[key]}, ${p1.x} ${p1[key]}`;
    }
    return d;
  };

  const visitorsPath = makePath("yVisitors");
  const viewsPath = makePath("yViews");

  // Area paths (closed to bottom)
  const makeAreaPath = (linePath: string): string => {
    if (points.length === 0 || !linePath) return "";
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = padding.top + chartInnerHeight;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const visitorsArea = makeAreaPath(visitorsPath);
  const viewsArea = makeAreaPath(viewsPath);

  // Y-axis grid ticks (4 divisions)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => {
    const val = Math.round(maxValue * pct);
    const y = padding.top + chartInnerHeight - pct * chartInnerHeight;
    return { val, y };
  });

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="bg-[#070707] border border-white/10 rounded-2xl p-5 md:p-6 space-y-6">
      {/* Top Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--accent-1)]" />
            <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider">
              Traffic Activity
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time daily visitor & page impression trajectory
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl self-start sm:self-auto">
          {(
            [
              { id: "today", label: "Today" },
              { id: "7d", label: "Last 7 Days" },
              { id: "30d", label: "Last 30 Days" },
              { id: "all", label: "All-Time" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => onRangeChange?.(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                timeRange === tab.id
                  ? "bg-[var(--accent-1)] text-black shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Switchers & Range Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMetric("both")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeMetric === "both"
                ? "bg-white/10 text-white border border-white/20"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            All Metrics
          </button>
          <button
            onClick={() => setActiveMetric("visitors")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeMetric === "visitors"
                ? "bg-[var(--accent-1)]/15 text-[var(--accent-1)] border border-[var(--accent-1)]/30"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent-1)]" />
            Visitors
          </button>
          <button
            onClick={() => setActiveMetric("views")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeMetric === "views"
                ? "bg-[#c9a227]/15 text-[#c9a227] border border-[#c9a227]/30"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#c9a227]" />
            Page Views
          </button>
        </div>

        {/* Aggregate in Range */}
        <div className="flex items-center gap-4 text-xs font-bold tracking-wider">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Users className="w-3.5 h-3.5 text-[var(--accent-1)]" />
            <span>Range Visitors:</span>
            <span className="text-white font-black">{totalVisitorsInRange}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Eye className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>Range Views:</span>
            <span className="text-white font-black">{totalViewsInRange}</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full aspect-[21/9] min-h-[240px] max-h-[340px]">
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-[var(--accent-1)]/20 border-t-[var(--accent-1)] rounded-full animate-spin" />
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
                Updating chart...
              </span>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* Visitors Gradient (Lime) */}
            <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CFF227" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#CFF227" stopOpacity="0.0" />
            </linearGradient>

            {/* Views Gradient (Gold) */}
            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9a227" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#c9a227" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={svgWidth - padding.right}
                y2={tick.y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                fill="rgba(161, 161, 170, 0.5)"
                fontSize="10"
                fontFamily="inherit"
                textAnchor="end"
                className="font-mono"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Views Area & Line */}
          {(activeMetric === "both" || activeMetric === "views") && (
            <>
              {viewsArea && <path d={viewsArea} fill="url(#viewsGrad)" />}
              {viewsPath && (
                <path
                  d={viewsPath}
                  fill="none"
                  stroke="#c9a227"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </>
          )}

          {/* Visitors Area & Line */}
          {(activeMetric === "both" || activeMetric === "visitors") && (
            <>
              {visitorsArea && <path d={visitorsArea} fill="url(#visitorsGrad)" />}
              {visitorsPath && (
                <path
                  d={visitorsPath}
                  fill="none"
                  stroke="#CFF227"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </>
          )}

          {/* Active hover crosshair and dots */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={padding.top + chartInnerHeight}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />

              {(activeMetric === "both" || activeMetric === "views") && (
                <circle
                  cx={activePoint.x}
                  cy={activePoint.yViews}
                  r="5"
                  fill="#c9a227"
                  stroke="#070707"
                  strokeWidth="2"
                />
              )}

              {(activeMetric === "both" || activeMetric === "visitors") && (
                <circle
                  cx={activePoint.x}
                  cy={activePoint.yVisitors}
                  r="6"
                  fill="#CFF227"
                  stroke="#070707"
                  strokeWidth="2"
                />
              )}
            </g>
          )}

          {/* Interactive Invisible hover columns */}
          {points.map((p, idx) => {
            const colWidth = chartInnerWidth / Math.max(1, points.length);
            return (
              <rect
                key={idx}
                x={p.x - colWidth / 2}
                y={padding.top}
                width={colWidth}
                height={chartInnerHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
              />
            );
          })}

          {/* X-axis date labels */}
          {points.map((p, idx) => {
            // Show every nth label to avoid crowding
            const step = Math.ceil(points.length / 8);
            if (idx % step !== 0 && idx !== points.length - 1) return null;

            return (
              <text
                key={idx}
                x={p.x}
                y={svgHeight - 12}
                fill="rgba(161, 161, 170, 0.6)"
                fontSize="10"
                fontFamily="inherit"
                textAnchor="middle"
                className="font-medium"
              >
                {p.label}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        <AnimatePresence>
          {activePoint && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                left: `${(activePoint.x / svgWidth) * 100}%`,
                top: "10%",
                transform: "translateX(-50%)",
              }}
              className="absolute z-30 pointer-events-none bg-[#0a0a0a] border border-white/20 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md min-w-[150px]"
            >
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 border-b border-white/10 pb-1">
                {activePoint.label}
              </p>
              <div className="space-y-1.5 text-xs">
                {(activeMetric === "both" || activeMetric === "visitors") && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-1)]" />
                      Visitors:
                    </span>
                    <span className="font-black text-white font-mono">
                      {activePoint.visitors}
                    </span>
                  </div>
                )}
                {(activeMetric === "both" || activeMetric === "views") && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <span className="w-2 h-2 rounded-full bg-[#c9a227]" />
                      Views:
                    </span>
                    <span className="font-black text-white font-mono">
                      {activePoint.pageViews}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty State Banner if no traffic yet */}
      {totalViewsInRange === 0 && (
        <div className="py-6 px-4 bg-white/[0.02] border border-white/5 rounded-xl text-center space-y-2">
          <BarChart2 className="w-6 h-6 text-zinc-600 mx-auto" />
          <p className="text-sm font-semibold text-zinc-400">
            No visitor traffic recorded for this filter yet
          </p>
          <p className="text-xs text-zinc-600 max-w-md mx-auto">
            Live visitor events will automatically display here as customers browse your store.
          </p>
        </div>
      )}
    </div>
  );
}

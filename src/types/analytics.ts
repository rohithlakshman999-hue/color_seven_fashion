export interface WebsiteVisit {
  id?: string;
  visitor_id: string;
  session_id: string;
  pathname: string;
  page_title?: string;
  referrer?: string;
  device_type?: "desktop" | "mobile" | "tablet";
  browser?: string;
  os?: string;
  ip_hash?: string;
  created_at: string;
}

export interface AnalyticsTrackPayload {
  visitorId: string;
  sessionId: string;
  pathname: string;
  title?: string;
  referrer?: string;
  deviceType?: "desktop" | "mobile" | "tablet";
}

export type AnalyticsTimeRange = "today" | "7d" | "30d" | "all";

export interface AnalyticsSummaryCards {
  totalUniqueVisitors: number;
  totalPageViews: number;
  todayVisitors: number;
  todayPageViews: number;
  last7DaysVisitors: number;
  last7DaysPageViews: number;
  last30DaysVisitors: number;
  last30DaysPageViews: number;
}

export interface AnalyticsChartPoint {
  date: string;
  label: string;
  visitors: number;
  pageViews: number;
}

export interface TopPageStat {
  pathname: string;
  pageViews: number;
  uniqueVisitors: number;
  percentage: number;
}

export interface DeviceDistribution {
  desktop: number;
  mobile: number;
  tablet: number;
  desktopPercent: number;
  mobilePercent: number;
  tabletPercent: number;
}

export interface RecentVisitActivity {
  id: string;
  pathname: string;
  pageTitle?: string;
  deviceType: "desktop" | "mobile" | "tablet";
  referrer?: string;
  createdAt: string;
  timeAgo: string;
  isNewVisitor: boolean;
}

export interface AnalyticsStorageStatus {
  source: "supabase" | "local_fallback";
  isCloudConnected: boolean;
  totalRecords: number;
  lastSyncAt?: string;
}

export interface AnalyticsDashboardData {
  summary: AnalyticsSummaryCards;
  timeRange: AnalyticsTimeRange;
  chartData: AnalyticsChartPoint[];
  topPages: TopPageStat[];
  devices: DeviceDistribution;
  recentVisits: RecentVisitActivity[];
  storageStatus: AnalyticsStorageStatus;
}

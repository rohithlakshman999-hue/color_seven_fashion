"use server";

import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";
import { getAnalyticsStats, syncLocalVisitsToSupabase } from "@/lib/analyticsStore";
import { AnalyticsDashboardData, AnalyticsTimeRange } from "@/types/analytics";

/**
 * Validates that the request comes from an authenticated administrator
 */
async function assertAdminAuth(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthed = await verifyAdminSessionToken(token);

  if (!isAuthed) {
    throw new Error("Unauthorized: Admin authentication required.");
  }
}

/**
 * Fetch analytics dashboard data with the specified time range filter
 */
export async function getAnalyticsDashboardAction(
  timeRange: AnalyticsTimeRange = "7d"
): Promise<{ success: boolean; data?: AnalyticsDashboardData; error?: string }> {
  try {
    await assertAdminAuth();
    const data = await getAnalyticsStats(timeRange);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load analytics",
    };
  }
}

/**
 * Trigger synchronization of locally stored records into Supabase cloud table
 */
export async function syncLocalAnalyticsAction(): Promise<{
  success: boolean;
  synced?: number;
  total?: number;
  error?: string;
}> {
  try {
    await assertAdminAuth();
    const result = await syncLocalVisitsToSupabase();
    if (result.error) {
      return { success: false, error: result.error, total: result.total };
    }
    return { success: true, synced: result.synced, total: result.total };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sync failed",
    };
  }
}

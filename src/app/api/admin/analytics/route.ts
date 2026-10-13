import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";
import { getAnalyticsStats, syncLocalVisitsToSupabase } from "@/lib/analyticsStore";
import { AnalyticsTimeRange } from "@/types/analytics";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    const isAuthed = await verifyAdminSessionToken(token);

    if (!isAuthed) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = (searchParams.get("range") || "7d") as AnalyticsTimeRange;
    const validRanges: AnalyticsTimeRange[] = ["today", "7d", "30d", "all"];
    const timeRange = validRanges.includes(range) ? range : "7d";

    const data = await getAnalyticsStats(timeRange);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Admin analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics statistics" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    const isAuthed = await verifyAdminSessionToken(token);

    if (!isAuthed) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    if (body.action === "sync") {
      const result = await syncLocalVisitsToSupabase();
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Action execution failed" },
      { status: 500 }
    );
  }
}

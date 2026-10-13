import { NextRequest, NextResponse } from "next/server";
import { recordVisit } from "@/lib/analyticsStore";
import { AnalyticsTrackPayload } from "@/types/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyticsTrackPayload;

    if (!body || !body.visitorId || !body.pathname) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;

    const userAgent = request.headers.get("user-agent") || undefined;

    const result = await recordVisit(body, ip, userAgent);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Analytics track error:", error);
    return NextResponse.json({ error: "Internal tracking error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

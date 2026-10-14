import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";
import { getCouponUsages } from "@/lib/couponsStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/coupons/usages
 * Fetches redemption history for all coupons or a specific coupon ID.
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    const isAuthed = await verifyAdminSessionToken(token);
    if (!isAuthed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const couponId = searchParams.get("couponId") || undefined;

    const usages = await getCouponUsages(couponId);
    return NextResponse.json({ success: true, usages });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load coupon usages" },
      { status: 500 }
    );
  }
}

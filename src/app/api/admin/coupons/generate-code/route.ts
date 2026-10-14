import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";
import { generateUniqueCouponCode } from "@/lib/couponsStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/coupons/generate-code?discount=1000&prefix=SAVE
 * Helper to dynamically propose a clean, unique coupon code.
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
    const discount = searchParams.get("discount") ? Number(searchParams.get("discount")) : undefined;
    const prefix = searchParams.get("prefix") || undefined;

    const code = await generateUniqueCouponCode(discount, prefix);
    return NextResponse.json({ success: true, code });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate code" },
      { status: 500 }
    );
  }
}

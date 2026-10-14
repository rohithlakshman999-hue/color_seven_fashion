import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";
import { updateCoupon, deleteCoupon } from "@/lib/couponsStore";

export const dynamic = "force-dynamic";

async function checkAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    return await verifyAdminSessionToken(token);
  } catch {
    return false;
  }
}

/**
 * PUT /api/admin/coupons/[id]
 * Updates coupon settings or toggles active status.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthed = await checkAdminAuth();
  if (!isAuthed) {
    return NextResponse.json(
      { error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updated = await updateCoupon(id, body);

    return NextResponse.json({
      success: true,
      message: `Coupon '${updated.code}' updated successfully.`,
      coupon: updated,
    });
  } catch (error: any) {
    console.error("[api/admin/coupons/[id]] PUT error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update coupon" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/admin/coupons/[id]
 * Deletes a coupon.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthed = await checkAdminAuth();
  if (!isAuthed) {
    return NextResponse.json(
      { error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required." },
        { status: 400 }
      );
    }

    await deleteCoupon(id);

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error: any) {
    console.error("[api/admin/coupons/[id]] DELETE error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete coupon" },
      { status: 500 }
    );
  }
}

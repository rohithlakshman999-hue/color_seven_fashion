import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";
import {
  getAllCoupons,
  getCouponStats,
  createCoupon,
  isCouponsTableReady,
} from "@/lib/couponsStore";

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
 * GET /api/admin/coupons
 * Admin endpoint to list all coupons, filter by status, search, and view KPI metrics.
 */
export async function GET(request: NextRequest) {
  const isAuthed = await checkAdminAuth();
  if (!isAuthed) {
    return NextResponse.json(
      { error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") || "all") as "all" | "active" | "inactive" | "expired";
    const sort = (searchParams.get("sort") || "newest") as "newest" | "oldest" | "highest_discount" | "most_used";

    const [coupons, stats, isDatabaseTableReady] = await Promise.all([
      getAllCoupons({ search, status, sort }),
      getCouponStats(),
      isCouponsTableReady(),
    ]);

    return NextResponse.json({
      success: true,
      coupons,
      stats,
      isDatabaseTableReady,
    });
  } catch (error: any) {
    console.error("[api/admin/coupons] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load discount coupons" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/coupons
 * Admin endpoint to create a new coupon with original_price and desired_price.
 */
export async function POST(request: NextRequest) {
  const isAuthed = await checkAdminAuth();
  if (!isAuthed) {
    return NextResponse.json(
      { error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      code,
      name,
      description,
      original_price,
      desired_price,
      desired_selling_price,
      applies_to,
      product_id,
      product_name,
      product_title,
      min_purchase_amount,
      min_order_amount,
      max_uses,
      max_uses_per_customer,
      start_date,
      expiry_date,
      is_active,
    } = body;

    const finalDesiredPrice = desired_price !== undefined && desired_price !== null
      ? desired_price
      : desired_selling_price;
    const finalProductName = product_name || product_title || null;
    const finalMinAmount = min_purchase_amount !== undefined && min_purchase_amount !== null
      ? min_purchase_amount
      : min_order_amount;

    // Required fields check
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Coupon name is required." },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { error: "Coupon code is required." },
        { status: 400 }
      );
    }

    if (original_price === undefined || original_price === null) {
      return NextResponse.json(
        { error: "Original price is required." },
        { status: 400 }
      );
    }

    if (finalDesiredPrice === undefined || finalDesiredPrice === null) {
      return NextResponse.json(
        { error: "Desired selling price is required." },
        { status: 400 }
      );
    }

    const newCoupon = await createCoupon({
      code,
      name,
      description,
      original_price: Number(original_price),
      desired_price: Number(finalDesiredPrice),
      applies_to: applies_to || "entire_order",
      product_id: product_id || null,
      product_name: finalProductName,
      min_purchase_amount: finalMinAmount !== undefined && finalMinAmount !== null ? Number(finalMinAmount) : undefined,
      max_uses: max_uses ? Number(max_uses) : null,
      max_uses_per_customer: max_uses_per_customer ? Number(max_uses_per_customer) : 1,
      start_date: start_date || null,
      expiry_date: expiry_date || null,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    return NextResponse.json({
      success: true,
      message: `Coupon '${newCoupon.code}' created successfully with ₹${newCoupon.discount_amount} discount!`,
      coupon: newCoupon,
    });
  } catch (error: any) {
    console.error("[api/admin/coupons] POST error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create coupon" },
      { status: 400 }
    );
  }
}

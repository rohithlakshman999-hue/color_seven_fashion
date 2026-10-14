import { NextRequest, NextResponse } from "next/server";
import { recordCouponUsage, validateCouponForCheckout } from "@/lib/couponsStore";

export const dynamic = "force-dynamic";

/**
 * POST /api/coupons/redeem
 * Records coupon usage upon order checkout / placement.
 * Ensures the order and coupon amounts are validated before redemption is tracked.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      couponCode,
      code,
      items,
      cartItems,
      orderId,
      customerName,
      customerPhone,
      customerRef,
    } = body;

    const codeToUse = couponCode || code;
    const rawItems = Array.isArray(items) ? items : (Array.isArray(cartItems) ? cartItems : []);

    if (!codeToUse || rawItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing coupon code or order items." },
        { status: 400 }
      );
    }

    const cleanItems = rawItems.map((i: any) => ({
      productId: String(i.productId || i.product?.id || i.id || ""),
      price: Number(i.price !== undefined ? i.price : (i.product?.price || 0)),
      quantity: Math.max(1, Number(i.quantity || 1)),
      name: i.name ? String(i.name) : (i.product?.name ? String(i.product.name) : undefined),
    }));

    // Verify validity one more time
    const validation = await validateCouponForCheckout(codeToUse, cleanItems);
    if (!validation.valid || !validation.coupon) {
      return NextResponse.json(
        { success: false, error: validation.error || "Coupon is not valid for redemption." },
        { status: 400 }
      );
    }

    const originalSubtotal = cleanItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const usage = await recordCouponUsage({
      couponId: validation.coupon.id,
      couponCode: validation.coupon.code,
      orderId,
      customerName: customerName || customerRef || "Customer",
      customerPhone: customerPhone || (customerRef?.startsWith("+") ? customerRef : "N/A"),
      customerRef: customerRef || customerPhone || customerName,
      originalAmount: originalSubtotal,
      discountAmount: validation.discountAmount,
      finalAmount: validation.finalPayable,
    });

    return NextResponse.json({
      success: true,
      message: "Coupon redemption recorded successfully.",
      usage,
    });
  } catch (error: any) {
    console.error("[api/coupons/redeem] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record coupon redemption." },
      { status: 500 }
    );
  }
}

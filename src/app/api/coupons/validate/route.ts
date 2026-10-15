import { NextRequest, NextResponse } from "next/server";
import { validateCouponForCheckout } from "@/lib/couponsStore";
import { supabase } from "@/lib/supabase";
import { calculateDiscount } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/**
 * POST /api/coupons/validate
 * Trusted server-side coupon validation for cart and checkout.
 * Calculates discount strictly from database values, never trusting frontend inputs.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code, items, cartItems } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid coupon code." },
        { status: 400 }
      );
    }

    const rawItems = Array.isArray(items) ? items : (Array.isArray(cartItems) ? cartItems : []);
    if (rawItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your shopping bag is empty." },
        { status: 400 }
      );
    }

    // Verify and enforce true server-side selling prices from DB
    const cleanItems = await Promise.all(
      rawItems.map(async (i: any) => {
        const productId = String(i.productId || i.product?.id || i.id || "");
        let serverPrice = Number(i.price !== undefined ? i.price : (i.product?.price || 0));

        if (productId && supabase) {
          const { data: dbProd } = await supabase
            .from("products")
            .select("original_price, discount_price")
            .eq("id", productId)
            .maybeSingle();

          if (dbProd) {
            const pricing = calculateDiscount(dbProd.original_price, dbProd.discount_price);
            serverPrice = pricing.sellingPrice;
          }
        }

        return {
          productId,
          price: serverPrice,
          quantity: Math.max(1, Number(i.quantity || 1)),
          name: i.name ? String(i.name) : (i.product?.name ? String(i.product.name) : undefined),
        };
      })
    );

    const result = await validateCouponForCheckout(code, cleanItems);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: result.error || "Coupon could not be applied.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      coupon: {
        id: result.coupon!.id,
        code: result.coupon!.code,
        name: result.coupon!.name,
        discount_amount: result.discountAmount,
        discount_percentage: result.coupon!.discount_percentage,
        applies_to: result.coupon!.applies_to,
        product_id: result.coupon!.product_id,
        product_name: result.coupon!.product_name,
        original_price: result.coupon!.original_price,
        desired_price: result.coupon!.desired_price,
      },
      discountAmount: result.discountAmount,
      eligibleSubtotal: result.eligibleSubtotal,
      finalPayable: result.finalPayable,
      message: `Coupon '${result.coupon!.code}' applied successfully! ₹${result.discountAmount.toLocaleString(
        "en-IN"
      )} saved.`,
    });
  } catch (error: any) {
    console.error("[api/coupons/validate] Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error while validating coupon." },
      { status: 500 }
    );
  }
}

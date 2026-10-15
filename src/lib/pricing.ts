/**
 * Pricing utilities for Sacred Tamil Gallery / Colour Seven Shop.
 * Handles Indian Rupee (INR) formatting, discount calculation,
 * and price validation.
 */

export interface PricingDetails {
  hasDiscount: boolean;
  sellingPrice: number;
  originalPrice: number;
  discountPercentage: number;
  savings: number;
}

/**
 * Format any numeric amount to Indian Rupee (INR) currency string with 2 decimal places.
 * Example: 420 -> "₹420.00", 299 -> "₹299.00"
 */
export function formatInrPrice(
  amount: number | string | null | undefined,
  showDecimals = true
): string {
  const numeric = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(numeric) || isNaN(numeric)) {
    return showDecimals ? "₹0.00" : "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(numeric);
}

/**
 * Calculate discount details between original MRP and selling price.
 */
export function calculateDiscount(
  originalPriceRaw: number | string | null | undefined,
  discountPriceRaw: number | string | null | undefined
): PricingDetails {
  const original = typeof originalPriceRaw === "number" ? originalPriceRaw : Number(originalPriceRaw);
  const discount = typeof discountPriceRaw === "number" ? discountPriceRaw : Number(discountPriceRaw);

  const validOriginal = Number.isFinite(original) && original > 0 ? original : 0;
  const validDiscount = Number.isFinite(discount) && discount > 0 ? discount : 0;

  // An active discount requires:
  // 1. A valid positive original price
  // 2. A valid positive discount price
  // 3. Discount price strictly lower than original price
  const hasDiscount = validOriginal > 0 && validDiscount > 0 && validDiscount < validOriginal;

  const sellingPrice = hasDiscount ? validDiscount : validOriginal;
  const originalPrice = validOriginal > 0 ? validOriginal : sellingPrice;
  const savings = hasDiscount ? originalPrice - sellingPrice : 0;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
    : 0;

  return {
    hasDiscount,
    sellingPrice,
    originalPrice,
    discountPercentage,
    savings,
  };
}

/**
 * Resolves pricing details from a Product object (handles both camelCase and snake_case properties).
 */
export function getProductPricing(product: {
  price?: number | null;
  original_price?: number | string | null;
  discount_price?: number | string | null;
  originalPrice?: number | string | null;
  discountPrice?: number | string | null;
  offer_percentage?: number | string | null;
  offerPercentage?: number | string | null;
}): PricingDetails {
  const orig = product.originalPrice ?? product.original_price ?? product.price ?? 0;
  const disc = product.discountPrice ?? product.discount_price ?? 0;

  return calculateDiscount(orig, disc);
}

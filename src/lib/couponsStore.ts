import fs from "fs";
import path from "path";
import crypto from "crypto";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { DiscountCoupon, CouponUsage } from "@/types/database";

const DATA_DIR = path.join(process.cwd(), "data");
const COUPONS_FILE = path.join(DATA_DIR, "coupons_store.json");
const USAGES_FILE = path.join(DATA_DIR, "coupon_usages.json");

let memoryCoupons: DiscountCoupon[] | null = null;
let memoryUsages: CouponUsage[] | null = null;
let couponsTableExists: boolean | null = null;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("[couponsStore] Could not create data directory:", err);
  }
}

function readLocalCoupons(): DiscountCoupon[] {
  if (memoryCoupons !== null) {
    return memoryCoupons;
  }
  ensureDataDir();
  try {
    if (fs.existsSync(COUPONS_FILE)) {
      const raw = fs.readFileSync(COUPONS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryCoupons = parsed;
        return memoryCoupons;
      }
    }
  } catch (err) {
    console.warn("[couponsStore] Error reading local coupons:", err);
  }
  memoryCoupons = [];
  return memoryCoupons;
}

function writeLocalCoupons(coupons: DiscountCoupon[]): void {
  memoryCoupons = coupons;
  ensureDataDir();
  try {
    fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2), "utf-8");
  } catch (err) {
    console.error("[couponsStore] Error writing local coupons:", err);
  }
}

function readLocalUsages(): CouponUsage[] {
  if (memoryUsages !== null) {
    return memoryUsages;
  }
  ensureDataDir();
  try {
    if (fs.existsSync(USAGES_FILE)) {
      const raw = fs.readFileSync(USAGES_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryUsages = parsed;
        return memoryUsages;
      }
    }
  } catch (err) {
    console.warn("[couponsStore] Error reading local usages:", err);
  }
  memoryUsages = [];
  return memoryUsages;
}

function writeLocalUsages(usages: CouponUsage[]): void {
  memoryUsages = usages;
  ensureDataDir();
  try {
    fs.writeFileSync(USAGES_FILE, JSON.stringify(usages, null, 2), "utf-8");
  } catch (err) {
    console.error("[couponsStore] Error writing local usages:", err);
  }
}

/**
 * Check if the discount_coupons table exists in Supabase.
 */
export async function isCouponsTableReady(): Promise<boolean> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return false;
  }
  if (couponsTableExists !== null) {
    return couponsTableExists;
  }

  try {
    const { error } = await supabaseAdmin
      .from("discount_coupons")
      .select("id")
      .limit(1);

    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (
        msg.includes("could not find the table") ||
        msg.includes("does not exist") ||
        msg.includes("42p01")
      ) {
        couponsTableExists = false;
        return false;
      }
    }
    couponsTableExists = true;
    return true;
  } catch {
    couponsTableExists = false;
    return false;
  }
}

/**
 * Normalize coupon codes (trim, uppercase, remove accidental internal spaces)
 */
export function normalizeCouponCode(code: string): string {
  return code ? code.trim().toUpperCase().replace(/\s+/g, "") : "";
}

/**
 * Generate a proposed unique coupon code based on discount amount or prefix.
 */
export async function generateUniqueCouponCode(
  discountAmount?: number,
  prefix?: string
): Promise<string> {
  const existing = await getAllCoupons();
  const existingCodes = new Set(existing.map((c) => c.code));

  let base = "";
  if (prefix && prefix.trim()) {
    base = normalizeCouponCode(prefix);
  } else if (discountAmount && discountAmount > 0) {
    base = `SAVE${Math.round(discountAmount)}`;
  } else {
    base = "COLOUR7";
  }

  // If base is already unique, return it
  if (!existingCodes.has(base)) {
    return base;
  }

  // Otherwise append clean random suffix (e.g. SAVE1000-X7)
  for (let i = 0; i < 50; i++) {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const candidate = `${base}-${rand}`;
    if (!existingCodes.has(candidate)) {
      return candidate;
    }
  }

  return `${base}-${Date.now().toString().slice(-4)}`;
}

/**
 * Fetch all coupons (Admin)
 */
export async function getAllCoupons(options?: {
  search?: string;
  status?: "all" | "active" | "inactive" | "expired";
  sort?: "newest" | "oldest" | "highest_discount" | "most_used";
}): Promise<DiscountCoupon[]> {
  const isReady = await isCouponsTableReady();
  let coupons: DiscountCoupon[] = [];

  if (isReady && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("discount_coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[couponsStore] Supabase fetch failed, using local:", error.message);
        coupons = readLocalCoupons();
      } else if (data) {
        coupons = data.map((row: any) => ({
          id: row.id,
          code: normalizeCouponCode(row.code),
          name: row.name,
          description: row.description || null,
          original_price: Number(row.original_price),
          desired_price: Number(row.desired_price),
          discount_amount: Number(row.discount_amount),
          discount_percentage: Number(row.discount_percentage),
          applies_to: row.applies_to || "entire_order",
          product_id: row.product_id || null,
          product_name: row.product_name || null,
          min_purchase_amount: Number(row.min_purchase_amount || 0),
          max_uses: row.max_uses !== null && row.max_uses !== undefined ? Number(row.max_uses) : null,
          used_count: Number(row.used_count || 0),
          max_uses_per_customer: Number(row.max_uses_per_customer || 1),
          start_date: row.start_date || null,
          expiry_date: row.expiry_date || null,
          is_active: Boolean(row.is_active),
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        writeLocalCoupons(coupons);
      }
    } catch (err) {
      console.warn("[couponsStore] Supabase exception, using local:", err);
      coupons = readLocalCoupons();
    }
  } else {
    coupons = readLocalCoupons();
  }

  // Filter by search
  if (options?.search && options.search.trim()) {
    const q = options.search.trim().toLowerCase();
    coupons = coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.product_name && c.product_name.toLowerCase().includes(q))
    );
  }

  // Filter by status
  const now = new Date();
  if (options?.status === "active") {
    coupons = coupons.filter((c) => {
      const notExpired = !c.expiry_date || new Date(c.expiry_date) > now;
      const notLimitReached = c.max_uses == null || c.used_count < c.max_uses;
      return c.is_active && notExpired && notLimitReached;
    });
  } else if (options?.status === "inactive") {
    coupons = coupons.filter((c) => !c.is_active);
  } else if (options?.status === "expired") {
    coupons = coupons.filter(
      (c) =>
        (c.expiry_date && new Date(c.expiry_date) <= now) ||
        (c.max_uses != null && c.used_count >= c.max_uses)
    );
  }

  // Sort
  const sortMode = options?.sort || "newest";
  coupons.sort((a, b) => {
    if (sortMode === "highest_discount") {
      return b.discount_amount - a.discount_amount;
    }
    if (sortMode === "most_used") {
      return b.used_count - a.used_count;
    }
    if (sortMode === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    // Default newest
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return coupons;
}

/**
 * Fetch a single coupon by Code
 */
export async function getCouponByCode(code: string): Promise<DiscountCoupon | null> {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return null;

  const all = await getAllCoupons();
  return all.find((c) => c.code === normalized) || null;
}

/**
 * Create a new Discount Coupon
 */
export async function createCoupon(payload: {
  code: string;
  name: string;
  description?: string | null;
  original_price: number;
  desired_price: number;
  applies_to?: "entire_order" | "specific_product";
  product_id?: string | null;
  product_name?: string | null;
  min_purchase_amount?: number;
  max_uses?: number | null;
  max_uses_per_customer?: number;
  start_date?: string | null;
  expiry_date?: string | null;
  is_active?: boolean;
}): Promise<DiscountCoupon> {
  const origPrice = Number(payload.original_price);
  const desPrice = Number(payload.desired_price);

  // Validate prices
  if (isNaN(origPrice) || origPrice <= 0) {
    throw new Error("Original price must be greater than zero.");
  }
  if (isNaN(desPrice) || desPrice < 0) {
    throw new Error("Desired selling price must be greater than or equal to zero.");
  }
  if (desPrice > origPrice) {
    throw new Error("Desired selling price cannot be higher than the original price.");
  }
  if (desPrice === origPrice) {
    throw new Error(
      "The desired price equals the original price. This coupon provides no discount (₹0 off). Please lower the desired selling price."
    );
  }

  const normalizedCode = normalizeCouponCode(payload.code);
  if (!normalizedCode || normalizedCode.length < 3) {
    throw new Error("Coupon code must be at least 3 characters long.");
  }

  // Validate code uniqueness
  const existing = await getCouponByCode(normalizedCode);
  if (existing) {
    throw new Error(`Coupon code '${normalizedCode}' already exists. Please choose a unique code.`);
  }

  const discountAmount = Math.round((origPrice - desPrice) * 100) / 100;
  const discountPercentage = Math.round(((discountAmount / origPrice) * 100) * 100) / 100;

  const newId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newCoupon: DiscountCoupon = {
    id: newId,
    code: normalizedCode,
    name: payload.name.trim(),
    description: payload.description?.trim() || null,
    original_price: origPrice,
    desired_price: desPrice,
    discount_amount: discountAmount,
    discount_percentage: discountPercentage,
    applies_to: payload.applies_to || "entire_order",
    product_id: payload.applies_to === "specific_product" ? payload.product_id || null : null,
    product_name: payload.applies_to === "specific_product" ? payload.product_name || null : null,
    min_purchase_amount:
      payload.min_purchase_amount !== undefined && payload.min_purchase_amount !== null
        ? Number(payload.min_purchase_amount)
        : origPrice,
    max_uses: payload.max_uses ? Number(payload.max_uses) : null,
    used_count: 0,
    max_uses_per_customer: Number(payload.max_uses_per_customer || 1),
    start_date: payload.start_date || null,
    expiry_date: payload.expiry_date || null,
    is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true,
    created_at: now,
    updated_at: now,
  };

  const isReady = await isCouponsTableReady();

  if (isReady && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("discount_coupons")
        .insert({
          id: newCoupon.id,
          code: newCoupon.code,
          name: newCoupon.name,
          description: newCoupon.description,
          original_price: newCoupon.original_price,
          desired_price: newCoupon.desired_price,
          discount_amount: newCoupon.discount_amount,
          discount_percentage: newCoupon.discount_percentage,
          applies_to: newCoupon.applies_to,
          product_id: newCoupon.product_id,
          product_name: newCoupon.product_name,
          min_purchase_amount: newCoupon.min_purchase_amount,
          max_uses: newCoupon.max_uses,
          used_count: newCoupon.used_count,
          max_uses_per_customer: newCoupon.max_uses_per_customer,
          start_date: newCoupon.start_date,
          expiry_date: newCoupon.expiry_date,
          is_active: newCoupon.is_active,
          created_at: newCoupon.created_at,
          updated_at: newCoupon.updated_at,
        })
        .select()
        .single();

      if (error) {
        console.error("[couponsStore] Supabase insert error:", error);
      } else if (data) {
        newCoupon.id = data.id;
      }
    } catch (err) {
      console.error("[couponsStore] Supabase insert exception:", err);
    }
  }

  // Update local file backup
  const local = readLocalCoupons();
  const updated = [newCoupon, ...local];
  writeLocalCoupons(updated);

  return newCoupon;
}

/**
 * Update an existing coupon
 */
export async function updateCoupon(
  id: string,
  updates: Partial<DiscountCoupon>
): Promise<DiscountCoupon> {
  const all = await getAllCoupons();
  const existing = all.find((c) => c.id === id);
  if (!existing) {
    throw new Error(`Coupon with ID ${id} not found.`);
  }

  const now = new Date().toISOString();

  // If code is changing, check uniqueness
  if (updates.code) {
    const norm = normalizeCouponCode(updates.code);
    const conflict = all.find((c) => c.id !== id && c.code === norm);
    if (conflict) {
      throw new Error(`Coupon code '${norm}' is already in use by another coupon.`);
    }
    updates.code = norm;
  }

  // Recalculate discount if prices change
  let origPrice = updates.original_price !== undefined ? Number(updates.original_price) : existing.original_price;
  let desPrice = updates.desired_price !== undefined
    ? Number(updates.desired_price)
    : (updates.desired_selling_price !== undefined ? Number(updates.desired_selling_price) : existing.desired_price);

  if (origPrice <= 0) {
    throw new Error("Original price must be greater than zero.");
  }
  if (desPrice < 0) {
    throw new Error("Desired selling price must be greater than or equal to zero.");
  }
  if (desPrice > origPrice) {
    throw new Error("Desired selling price cannot be higher than the original price.");
  }

  const discountAmount = Math.round((origPrice - desPrice) * 100) / 100;
  const discountPercentage = Math.round(((discountAmount / origPrice) * 100) * 100) / 100;

  const merged: DiscountCoupon = {
    ...existing,
    ...updates,
    original_price: origPrice,
    desired_price: desPrice,
    discount_amount: discountAmount,
    discount_percentage: discountPercentage,
    updated_at: now,
  };

  const isReady = await isCouponsTableReady();

  if (isReady && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from("discount_coupons")
        .update({
          code: merged.code,
          name: merged.name,
          description: merged.description,
          original_price: merged.original_price,
          desired_price: merged.desired_price,
          discount_amount: merged.discount_amount,
          discount_percentage: merged.discount_percentage,
          applies_to: merged.applies_to,
          product_id: merged.product_id,
          product_name: merged.product_name,
          min_purchase_amount: merged.min_purchase_amount,
          max_uses: merged.max_uses,
          is_active: merged.is_active,
          start_date: merged.start_date,
          expiry_date: merged.expiry_date,
          updated_at: now,
        })
        .eq("id", id);

      if (error) {
        console.error("[couponsStore] Supabase update error:", error);
      }
    } catch (err) {
      console.error("[couponsStore] Supabase update exception:", err);
    }
  }

  // Update local file
  const local = readLocalCoupons();
  const index = local.findIndex((c) => c.id === id);
  if (index !== -1) {
    local[index] = merged;
    writeLocalCoupons(local);
  }

  return merged;
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(id: string): Promise<boolean> {
  const isReady = await isCouponsTableReady();

  if (isReady && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin.from("discount_coupons").delete().eq("id", id);
      if (error) console.error("[couponsStore] Supabase delete error:", error);
    } catch (err) {
      console.error("[couponsStore] Supabase delete exception:", err);
    }
  }

  const local = readLocalCoupons();
  const filtered = local.filter((c) => c.id !== id);
  writeLocalCoupons(filtered);

  return true;
}

/**
 * Toggle Active status
 */
export async function toggleCouponActive(id: string, is_active: boolean): Promise<DiscountCoupon> {
  return updateCoupon(id, { is_active });
}

/**
 * TRUSTED BACKEND VALIDATION:
 * Validates a coupon against current cart items and server-side business rules.
 * Never trust client-submitted calculations!
 */
export async function validateCouponForCheckout(
  code: string,
  cartItems: Array<{
    productId: string;
    price: number;
    quantity: number;
    name?: string;
  }>
): Promise<{
  valid: boolean;
  coupon?: DiscountCoupon;
  discountAmount: number;
  eligibleSubtotal: number;
  finalPayable: number;
  error?: string;
}> {
  const normalized = normalizeCouponCode(code);
  if (!normalized) {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      finalPayable: 0,
      error: "Please enter a coupon code.",
    };
  }

  const coupon = await getCouponByCode(normalized);
  if (!coupon) {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      finalPayable: 0,
      error: `Invalid coupon code '${normalized}'. Please check for typos.`,
    };
  }

  // 1. Check if active
  if (!coupon.is_active) {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      finalPayable: 0,
      error: `Coupon '${normalized}' is currently inactive.`,
    };
  }

  const now = new Date();

  // 2. Check start date
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    const formatted = new Date(coupon.start_date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      finalPayable: 0,
      error: `Coupon '${normalized}' will become active on ${formatted}.`,
    };
  }

  // 3. Check expiry date
  if (coupon.expiry_date && new Date(coupon.expiry_date) < now) {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      finalPayable: 0,
      error: `Coupon '${normalized}' has expired.`,
    };
  }

  // 4. Check total usage limit
  if (coupon.max_uses != null && coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      finalPayable: 0,
      error: `Coupon '${normalized}' has reached its maximum redemption limit.`,
    };
  }

  if (!cartItems || cartItems.length === 0) {
    return {
      valid: false,
      discountAmount: 0,
      eligibleSubtotal: 0,
      finalPayable: 0,
      error: "Your cart is empty.",
    };
  }

  // 5. Calculate eligible subtotal and verified discount
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (coupon.applies_to === "specific_product") {
    // Only apply to the designated product
    const eligibleItem = cartItems.find((item) => item.productId === coupon.product_id);
    if (!eligibleItem) {
      const targetName = coupon.product_name || "the designated eligible item";
      return {
        valid: false,
        discountAmount: 0,
        eligibleSubtotal: cartSubtotal,
        finalPayable: cartSubtotal,
        error: `Coupon '${normalized}' is only valid when purchasing ${targetName}.`,
      };
    }

    const eligibleAmount = eligibleItem.price * eligibleItem.quantity;
    if (coupon.min_purchase_amount > 0 && eligibleAmount < coupon.min_purchase_amount) {
      return {
        valid: false,
        discountAmount: 0,
        eligibleSubtotal: eligibleAmount,
        finalPayable: cartSubtotal,
        error: `Minimum eligible item amount of ₹${coupon.min_purchase_amount.toLocaleString(
          "en-IN"
        )} required to use this coupon.`,
      };
    }

    // Discount cannot exceed the eligible item price
    const calculatedDiscount = Math.min(coupon.discount_amount, eligibleAmount);
    const finalTotal = Math.max(0, cartSubtotal - calculatedDiscount);

    return {
      valid: true,
      coupon,
      discountAmount: calculatedDiscount,
      eligibleSubtotal: eligibleAmount,
      finalPayable: finalTotal,
    };
  } else {
    // Entire Order
    if (coupon.min_purchase_amount > 0 && cartSubtotal < coupon.min_purchase_amount) {
      return {
        valid: false,
        discountAmount: 0,
        eligibleSubtotal: cartSubtotal,
        finalPayable: cartSubtotal,
        error: `Minimum order subtotal of ₹${coupon.min_purchase_amount.toLocaleString(
          "en-IN"
        )} required to use coupon '${normalized}'.`,
      };
    }

    // Discount cannot exceed cart subtotal
    const calculatedDiscount = Math.min(coupon.discount_amount, cartSubtotal);
    const finalTotal = Math.max(0, cartSubtotal - calculatedDiscount);

    return {
      valid: true,
      coupon,
      discountAmount: calculatedDiscount,
      eligibleSubtotal: cartSubtotal,
      finalPayable: finalTotal,
    };
  }
}

/**
 * Record a successful coupon redemption
 */
export async function recordCouponUsage(params: {
  couponId: string;
  couponCode: string;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}): Promise<CouponUsage> {
  const usageId = crypto.randomUUID();
  const now = new Date().toISOString();

  const usage: CouponUsage = {
    id: usageId,
    coupon_id: params.couponId,
    coupon_code: normalizeCouponCode(params.couponCode),
    order_id: params.orderId || `ORD-${Date.now().toString().slice(-6)}`,
    customer_name: params.customerName || "Customer",
    customer_phone: params.customerPhone || "N/A",
    original_amount: params.originalAmount,
    discount_amount: params.discountAmount,
    final_amount: params.finalAmount,
    created_at: now,
  };

  const isReady = await isCouponsTableReady();

  // 1. Increment used_count in Supabase
  if (isReady && supabaseAdmin) {
    try {
      await supabaseAdmin.rpc("increment_coupon_usage", { c_id: params.couponId });
    } catch {
      // Fallback update
      try {
        const { data: current } = await supabaseAdmin
          .from("discount_coupons")
          .select("used_count")
          .eq("id", params.couponId)
          .single();
        if (current) {
          await supabaseAdmin
            .from("discount_coupons")
            .update({ used_count: (current.used_count || 0) + 1 })
            .eq("id", params.couponId);
        }
      } catch (e) {
        console.warn("[couponsStore] Supabase usage increment error:", e);
      }
    }

    // Insert into coupon_usages table
    try {
      await supabaseAdmin.from("coupon_usages").insert({
        id: usage.id,
        coupon_id: usage.coupon_id,
        coupon_code: usage.coupon_code,
        order_id: usage.order_id,
        customer_name: usage.customer_name,
        customer_phone: usage.customer_phone,
        original_amount: usage.original_amount,
        discount_amount: usage.discount_amount,
        final_amount: usage.final_amount,
        created_at: usage.created_at,
      });
    } catch (e) {
      console.warn("[couponsStore] Supabase usage log error:", e);
    }
  }

  // 2. Increment local coupon used_count
  const localCoupons = readLocalCoupons();
  const couponIndex = localCoupons.findIndex((c) => c.id === params.couponId);
  if (couponIndex !== -1) {
    localCoupons[couponIndex].used_count = (localCoupons[couponIndex].used_count || 0) + 1;
    writeLocalCoupons(localCoupons);
  }

  // 3. Append to local usages file
  const localUsages = readLocalUsages();
  const updatedUsages = [usage, ...localUsages];
  writeLocalUsages(updatedUsages);

  return usage;
}

/**
 * Fetch Coupon Usages / Redemptions (Admin)
 */
export async function getCouponUsages(couponId?: string): Promise<CouponUsage[]> {
  const isReady = await isCouponsTableReady();

  if (isReady && supabaseAdmin) {
    try {
      let query = supabaseAdmin
        .from("coupon_usages")
        .select("*")
        .order("created_at", { ascending: false });

      if (couponId) {
        query = query.eq("coupon_id", couponId);
      }

      const { data, error } = await query;
      if (!error && data) {
        const mapped = data.map((row: any) => ({
          id: row.id,
          coupon_id: row.coupon_id,
          coupon_code: row.coupon_code,
          order_id: row.order_id,
          customer_name: row.customer_name,
          customer_phone: row.customer_phone,
          original_amount: Number(row.original_amount),
          discount_amount: Number(row.discount_amount),
          final_amount: Number(row.final_amount),
          created_at: row.created_at,
        }));
        writeLocalUsages(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn("[couponsStore] Supabase usages fetch exception:", err);
    }
  }

  const local = readLocalUsages();
  if (couponId) {
    return local.filter((u) => u.coupon_id === couponId);
  }
  return local;
}

/**
 * Get Coupon Statistics for Admin Dashboard
 */
export async function getCouponStats(): Promise<{
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
  totalDiscountSaved: number;
}> {
  const coupons = await getAllCoupons();
  const usages = await getCouponUsages();

  const now = new Date();
  const activeCount = coupons.filter((c) => {
    const notExpired = !c.expiry_date || new Date(c.expiry_date) > now;
    const notLimitReached = c.max_uses == null || c.used_count < c.max_uses;
    return c.is_active && notExpired && notLimitReached;
  }).length;

  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);
  const totalDiscountSaved = usages.reduce((sum, u) => sum + u.discount_amount, 0);

  return {
    totalCoupons: coupons.length,
    activeCoupons: activeCount,
    totalRedemptions,
    totalDiscountSaved,
  };
}

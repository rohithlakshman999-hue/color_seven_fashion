import fs from "fs";
import path from "path";
import crypto from "crypto";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { CustomerReview } from "@/types/database";

const DATA_DIR = path.join(process.cwd(), "data");
const REVIEWS_FILE = path.join(DATA_DIR, "customer_reviews.json");

// In-memory cache
let memoryReviews: CustomerReview[] | null = null;
let supabaseTableExists: boolean | null = null;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("[reviewsStore] Could not create data directory:", err);
  }
}

function readLocalReviews(): CustomerReview[] {
  if (memoryReviews !== null) {
    return memoryReviews;
  }
  ensureDataDir();
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const raw = fs.readFileSync(REVIEWS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryReviews = parsed;
        return memoryReviews;
      }
    }
  } catch (err) {
    console.warn("[reviewsStore] Error reading local reviews:", err);
  }
  memoryReviews = [];
  return memoryReviews;
}

function writeLocalReviews(reviews: CustomerReview[]): void {
  memoryReviews = reviews;
  ensureDataDir();
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
  } catch (err) {
    console.error("[reviewsStore] Error writing local reviews:", err);
  }
}

/**
 * Check if the customer_reviews table exists in Supabase.
 */
export async function isCustomerReviewsTableReady(): Promise<boolean> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return false;
  }
  if (supabaseTableExists !== null) {
    return supabaseTableExists;
  }

  try {
    const { error } = await supabaseAdmin
      .from("customer_reviews")
      .select("id")
      .limit(1);

    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("could not find the table") || msg.includes("does not exist") || msg.includes("42p01")) {
        supabaseTableExists = false;
        return false;
      }
    }
    supabaseTableExists = true;
    return true;
  } catch {
    supabaseTableExists = false;
    return false;
  }
}

/**
 * Fetch all reviews (Admin only)
 */
export async function getAllReviews(options?: {
  sort?: "newest" | "oldest" | "highest" | "lowest";
  search?: string;
  status?: "all" | "published" | "unpublished";
}): Promise<CustomerReview[]> {
  const isReady = await isCustomerReviewsTableReady();

  let reviews: CustomerReview[] = [];

  if (isReady && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("customer_reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[reviewsStore] Supabase fetch failed, falling back to local:", error.message);
        reviews = readLocalReviews();
      } else if (data) {
        reviews = data.map((row: any) => ({
          id: row.id,
          customer_name: row.customer_name,
          customer_image: row.customer_image || null,
          rating: Number(row.rating),
          review_text: row.review_text,
          designation: row.designation || null,
          is_published: Boolean(row.is_published),
          review_date: row.review_date || row.created_at?.slice(0, 10),
          display_order: row.display_order ?? 0,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        // Update local cache
        writeLocalReviews(reviews);
      }
    } catch (err) {
      console.warn("[reviewsStore] Supabase exception, using local:", err);
      reviews = readLocalReviews();
    }
  } else {
    reviews = readLocalReviews();
  }

  // Filter by status
  if (options?.status === "published") {
    reviews = reviews.filter((r) => r.is_published);
  } else if (options?.status === "unpublished") {
    reviews = reviews.filter((r) => !r.is_published);
  }

  // Filter by search query
  if (options?.search && options.search.trim()) {
    const q = options.search.trim().toLowerCase();
    reviews = reviews.filter(
      (r) =>
        r.customer_name.toLowerCase().includes(q) ||
        r.review_text.toLowerCase().includes(q) ||
        (r.designation && r.designation.toLowerCase().includes(q))
    );
  }

  // Sort
  const sortMode = options?.sort || "newest";
  reviews.sort((a, b) => {
    if (sortMode === "highest") {
      return b.rating - a.rating || new Date(b.review_date).getTime() - new Date(a.review_date).getTime();
    }
    if (sortMode === "lowest") {
      return a.rating - b.rating || new Date(b.review_date).getTime() - new Date(a.review_date).getTime();
    }
    if (sortMode === "oldest") {
      return new Date(a.review_date).getTime() - new Date(b.review_date).getTime();
    }
    // Default newest
    return new Date(b.review_date).getTime() - new Date(a.review_date).getTime();
  });

  return reviews;
}

/**
 * Fetch published reviews for public presentation (Homepage & Reviews Page).
 * Unpublished reviews are NEVER returned by this function.
 */
export async function getPublishedReviews(options?: {
  sort?: "newest" | "oldest" | "highest" | "lowest";
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ reviews: CustomerReview[]; total: number; averageRating: number }> {
  // Always query published reviews
  const all = await getAllReviews({
    status: "published",
    sort: options?.sort || "newest",
    search: options?.search,
  });

  const total = all.length;
  const avg =
    total > 0
      ? Number((all.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
      : 0;

  const offset = options?.offset || 0;
  const limit = options?.limit !== undefined ? options.limit : all.length;
  const paginated = all.slice(offset, offset + limit);

  return {
    reviews: paginated,
    total,
    averageRating: avg,
  };
}

/**
 * Calculate review statistics for summary cards.
 */
export async function getReviewStats(): Promise<{
  totalReviews: number;
  publishedCount: number;
  unpublishedCount: number;
  averageRating: number;
  ratingCounts: { [stars: number]: number };
}> {
  const all = await getAllReviews({ status: "all" });
  const published = all.filter((r) => r.is_published);

  const ratingCounts: { [stars: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sumRating = 0;

  published.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
    sumRating += r.rating;
  });

  const avg = published.length > 0 ? Number((sumRating / published.length).toFixed(1)) : 0;

  return {
    totalReviews: all.length,
    publishedCount: published.length,
    unpublishedCount: all.length - published.length,
    averageRating: avg,
    ratingCounts,
  };
}

/**
 * Add a new customer review (Admin only)
 */
export async function addCustomerReview(
  payload: Omit<CustomerReview, "id" | "created_at" | "updated_at">
): Promise<CustomerReview> {
  const newId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newReview: CustomerReview = {
    id: newId,
    customer_name: payload.customer_name.trim(),
    customer_image: payload.customer_image?.trim() || null,
    rating: Math.min(5, Math.max(1, Number(payload.rating) || 5)),
    review_text: payload.review_text.trim(),
    designation: payload.designation?.trim() || null,
    is_published: Boolean(payload.is_published),
    review_date: payload.review_date || now.slice(0, 10),
    display_order: payload.display_order ?? 0,
    created_at: now,
    updated_at: now,
  };

  const isReady = await isCustomerReviewsTableReady();

  if (isReady && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("customer_reviews")
        .insert({
          id: newReview.id,
          customer_name: newReview.customer_name,
          customer_image: newReview.customer_image,
          rating: newReview.rating,
          review_text: newReview.review_text,
          designation: newReview.designation,
          is_published: newReview.is_published,
          review_date: newReview.review_date,
          display_order: newReview.display_order,
          created_at: newReview.created_at,
          updated_at: newReview.updated_at,
        })
        .select()
        .single();

      if (error) {
        console.error("[reviewsStore] Supabase insert error:", error);
      } else if (data) {
        newReview.id = data.id;
      }
    } catch (err) {
      console.error("[reviewsStore] Supabase insert exception:", err);
    }
  }

  // Update local file backup
  const local = readLocalReviews();
  const updated = [newReview, ...local];
  writeLocalReviews(updated);

  return newReview;
}

/**
 * Update an existing review (Admin only)
 */
export async function updateCustomerReview(
  id: string,
  updates: Partial<CustomerReview>
): Promise<CustomerReview> {
  const now = new Date().toISOString();
  const isReady = await isCustomerReviewsTableReady();

  const cleanUpdates: Record<string, any> = {
    ...updates,
    updated_at: now,
  };
  if (updates.rating !== undefined) {
    cleanUpdates.rating = Math.min(5, Math.max(1, Number(updates.rating)));
  }
  if (updates.customer_name !== undefined) {
    cleanUpdates.customer_name = updates.customer_name.trim();
  }
  if (updates.review_text !== undefined) {
    cleanUpdates.review_text = updates.review_text.trim();
  }
  if (updates.designation !== undefined) {
    cleanUpdates.designation = updates.designation ? updates.designation.trim() : null;
  }

  delete cleanUpdates.id;
  delete cleanUpdates.created_at;

  if (isReady && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from("customer_reviews")
        .update(cleanUpdates)
        .eq("id", id);

      if (error) {
        console.error("[reviewsStore] Supabase update error:", error);
      }
    } catch (err) {
      console.error("[reviewsStore] Supabase update exception:", err);
    }
  }

  // Update local file
  const local = readLocalReviews();
  const index = local.findIndex((r) => r.id === id);
  if (index !== -1) {
    local[index] = {
      ...local[index],
      ...cleanUpdates,
    };
    writeLocalReviews(local);
    return local[index];
  }

  throw new Error(`Review with ID ${id} not found.`);
}

/**
 * Delete a review (Admin only)
 */
export async function deleteCustomerReview(id: string): Promise<boolean> {
  const isReady = await isCustomerReviewsTableReady();

  if (isReady && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from("customer_reviews")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("[reviewsStore] Supabase delete error:", error);
      }
    } catch (err) {
      console.error("[reviewsStore] Supabase delete exception:", err);
    }
  }

  // Delete from local file
  const local = readLocalReviews();
  const filtered = local.filter((r) => r.id !== id);
  writeLocalReviews(filtered);

  return true;
}

/**
 * Toggle publish status (Admin only)
 */
export async function toggleReviewPublish(id: string, is_published: boolean): Promise<CustomerReview> {
  return updateCustomerReview(id, { is_published });
}

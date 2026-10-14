import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";
import {
  getAllReviews,
  getReviewStats,
  addCustomerReview,
  isCustomerReviewsTableReady,
} from "@/lib/reviewsStore";

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
 * GET /api/admin/reviews
 * Admin endpoint to list all customer reviews (both published and unpublished),
 * filter by status, sort, and search.
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
    const sort = (searchParams.get("sort") || "newest") as "newest" | "oldest" | "highest" | "lowest";
    const status = (searchParams.get("status") || "all") as "all" | "published" | "unpublished";
    const search = searchParams.get("search") || undefined;

    const [reviews, stats, isDatabaseTableReady] = await Promise.all([
      getAllReviews({ sort, status, search }),
      getReviewStats(),
      isCustomerReviewsTableReady(),
    ]);

    return NextResponse.json({
      success: true,
      reviews,
      stats,
      isDatabaseTableReady,
    });
  } catch (error) {
    console.error("[api/admin/reviews] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load customer reviews" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/reviews
 * Admin endpoint to add a new customer review.
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
      customer_name,
      customer_image,
      rating,
      review_text,
      designation,
      is_published,
      review_date,
    } = body;

    // Server-side validation
    if (!customer_name || typeof customer_name !== "string" || !customer_name.trim()) {
      return NextResponse.json(
        { error: "Customer name is required and cannot be empty." },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5." },
        { status: 400 }
      );
    }

    if (!review_text || typeof review_text !== "string" || !review_text.trim()) {
      return NextResponse.json(
        { error: "Review description is required." },
        { status: 400 }
      );
    }

    const newReview = await addCustomerReview({
      customer_name: customer_name.trim(),
      customer_image: customer_image?.trim() || null,
      rating: numericRating,
      review_text: review_text.trim(),
      designation: designation?.trim() || null,
      is_published: is_published !== undefined ? Boolean(is_published) : true,
      review_date: review_date || new Date().toISOString().slice(0, 10),
    });

    return NextResponse.json({
      success: true,
      message: "Customer review created successfully.",
      review: newReview,
    });
  } catch (error) {
    console.error("[api/admin/reviews] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create customer review" },
      { status: 500 }
    );
  }
}

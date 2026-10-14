import { NextRequest, NextResponse } from "next/server";
import { getPublishedReviews, getReviewStats } from "@/lib/reviewsStore";

export const dynamic = "force-dynamic";

/**
 * Public endpoint to fetch published customer reviews.
 * Unpublished reviews are NEVER exposed through this endpoint.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = (searchParams.get("sort") || "newest") as "newest" | "oldest" | "highest" | "lowest";
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;

    const data = await getPublishedReviews({
      sort,
      search,
      limit,
      offset,
    });

    const stats = await getReviewStats();

    return NextResponse.json({
      success: true,
      reviews: data.reviews,
      total: data.total,
      averageRating: data.averageRating,
      ratingCounts: stats.ratingCounts,
    });
  } catch (error) {
    console.error("[api/reviews] Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch published customer reviews" },
      { status: 500 }
    );
  }
}

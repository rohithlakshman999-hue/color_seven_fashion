import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";
import { updateCustomerReview, deleteCustomerReview } from "@/lib/reviewsStore";

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
 * PUT /api/admin/reviews/[id]
 * Update an existing customer review or toggle its publish status.
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
        { error: "Review ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate if fields are provided
    if (body.customer_name !== undefined && !body.customer_name.trim()) {
      return NextResponse.json(
        { error: "Customer name cannot be empty." },
        { status: 400 }
      );
    }

    if (body.rating !== undefined) {
      const numRating = Number(body.rating);
      if (!numRating || numRating < 1 || numRating > 5) {
        return NextResponse.json(
          { error: "Rating must be between 1 and 5." },
          { status: 400 }
        );
      }
    }

    if (body.review_text !== undefined && !body.review_text.trim()) {
      return NextResponse.json(
        { error: "Review description cannot be empty." },
        { status: 400 }
      );
    }

    const updated = await updateCustomerReview(id, body);

    return NextResponse.json({
      success: true,
      message: "Customer review updated successfully.",
      review: updated,
    });
  } catch (error: any) {
    console.error("[api/admin/reviews/[id]] PUT error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update review" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Delete a customer review.
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
        { error: "Review ID is required." },
        { status: 400 }
      );
    }

    await deleteCustomerReview(id);

    return NextResponse.json({
      success: true,
      message: "Customer review deleted successfully.",
    });
  } catch (error: any) {
    console.error("[api/admin/reviews/[id]] DELETE error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}

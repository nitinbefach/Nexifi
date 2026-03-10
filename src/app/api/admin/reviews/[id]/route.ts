import { NextRequest, NextResponse } from "next/server";
import { updateReviewStatus, deleteReview } from "@/lib/supabase/admin-queries";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { is_approved } = body;

    if (typeof is_approved !== "boolean") {
      return NextResponse.json(
        { error: "is_approved (boolean) is required" },
        { status: 400 }
      );
    }

    const { review, error } = await updateReviewStatus(id, is_approved);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update review" },
        { status: 500 }
      );
    }

    return NextResponse.json({ review });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await deleteReview(id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete review" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

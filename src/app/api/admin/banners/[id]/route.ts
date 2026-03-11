import { NextRequest, NextResponse } from "next/server";
import { updateBanner, deleteBanner } from "@/lib/supabase/admin-queries";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      "title", "image_url", "mobile_image_url", "link_url", "sort_order", "is_active",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { banner, error } = await updateBanner(id, updateData);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update banner" },
        { status: 500 }
      );
    }

    return NextResponse.json({ banner });
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
  const { error } = await deleteBanner(id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete banner" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

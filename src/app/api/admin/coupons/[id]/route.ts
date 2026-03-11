import { NextRequest, NextResponse } from "next/server";
import { updateCoupon, deleteCoupon } from "@/lib/supabase/admin-queries";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      "code", "description", "discount_type", "discount_value",
      "min_order_amount", "max_discount_amount", "usage_limit",
      "is_active", "valid_from", "valid_until",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (updateData.code) {
      updateData.code = (updateData.code as string).toUpperCase();
    }

    const { coupon, error } = await updateCoupon(id, updateData);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update coupon" },
        { status: 500 }
      );
    }

    return NextResponse.json({ coupon });
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
  const { error } = await deleteCoupon(id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete coupon" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

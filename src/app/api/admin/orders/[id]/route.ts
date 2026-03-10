import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/supabase/admin-queries";

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const { order, error } = await updateOrderStatus(id, status);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update order status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { updateReturnStatus, deleteReturn } from "@/lib/supabase/admin-queries";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, admin_notes, refund_amount } = body;

    if (!status && admin_notes === undefined && refund_amount === undefined) {
      return NextResponse.json(
        { error: "At least one field (status, admin_notes, refund_amount) is required" },
        { status: 400 }
      );
    }

    const updateData: { status?: string; admin_notes?: string; refund_amount?: number } = {};
    if (status) updateData.status = status;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    if (refund_amount !== undefined) updateData.refund_amount = refund_amount;

    const { returnRequest, error } = await updateReturnStatus(id, updateData);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update return request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ returnRequest });
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
  const { error } = await deleteReturn(id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete return request" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

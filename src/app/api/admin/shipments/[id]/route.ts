import { NextRequest, NextResponse } from "next/server";
import { updateShipment, deleteShipment } from "@/lib/supabase/admin-queries";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      "awb_number",
      "courier_name",
      "tracking_url",
      "status",
      "estimated_delivery",
      "weight_kg",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updateData.updated_at = new Date().toISOString();

    const { shipment, error } = await updateShipment(id, updateData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ shipment });
  } catch (error) {
    console.error("Update shipment error:", error);
    return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await deleteShipment(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete shipment error:", error);
    return NextResponse.json({ error: "Failed to delete shipment" }, { status: 500 });
  }
}

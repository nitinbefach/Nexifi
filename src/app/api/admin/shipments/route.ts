import { NextRequest, NextResponse } from "next/server";
import { createShipment, updateOrderStatus } from "@/lib/supabase/admin-queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, awb_number, courier_name, tracking_url, estimated_delivery, weight_kg } = body;

    if (!order_id || !awb_number || !courier_name) {
      return NextResponse.json(
        { error: "Order ID, AWB number, and courier name are required" },
        { status: 400 }
      );
    }

    const { shipment, error } = await createShipment({
      order_id,
      awb_number,
      courier_name,
      tracking_url: tracking_url || null,
      estimated_delivery: estimated_delivery || null,
      weight_kg: weight_kg || null,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update order status to "shipped"
    await updateOrderStatus(order_id, "shipped");

    return NextResponse.json({ shipment }, { status: 201 });
  } catch (error) {
    console.error("Create shipment error:", error);
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 });
  }
}

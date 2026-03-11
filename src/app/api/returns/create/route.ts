import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { returnRequestSchema } from "@/validators/return-request.schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, ...rest } = body;

    // Validate required order_id separately
    if (!order_id || typeof order_id !== "string") {
      return NextResponse.json(
        { error: "order_id is required" },
        { status: 400 }
      );
    }

    // Validate the rest with Zod schema
    const parsed = returnRequestSchema.safeParse(rest);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    // Verify the order exists and is delivered
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== "delivered") {
      return NextResponse.json(
        { error: "Only delivered orders can be returned" },
        { status: 400 }
      );
    }

    // Check if a return request already exists for this order item
    const { data: existingReturn } = await supabaseAdmin
      .from("return_requests")
      .select("id")
      .eq("order_id", order_id)
      .eq("order_item_id", parsed.data.order_item_id)
      .maybeSingle();

    if (existingReturn) {
      return NextResponse.json(
        { error: "A return request already exists for this item" },
        { status: 409 }
      );
    }

    // Insert the return request
    const { data: returnRequest, error: insertError } = await supabaseAdmin
      .from("return_requests")
      .insert({
        order_id,
        order_item_id: parsed.data.order_item_id,
        reason: parsed.data.reason,
        description: parsed.data.description,
        images: parsed.data.images || [],
        status: "requested",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Return request insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create return request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ returnRequest }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

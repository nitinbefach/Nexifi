import { NextRequest, NextResponse } from "next/server";
import { createCoupon } from "@/lib/supabase/admin-queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code, description, discount_type, discount_value,
      min_order_amount, max_discount_amount, usage_limit,
      is_active, valid_from, valid_until,
    } = body;

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json(
        { error: "Code, discount type, and discount value are required" },
        { status: 400 }
      );
    }

    const { coupon, error } = await createCoupon({
      code: code.toUpperCase(),
      description: description || null,
      discount_type,
      discount_value: Number(discount_value),
      min_order_amount: min_order_amount ? Number(min_order_amount) : 0,
      max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
      usage_limit: usage_limit ? Number(usage_limit) : null,
      is_active: is_active ?? true,
      valid_from: valid_from || null,
      valid_until: valid_until || null,
    });

    if (error) {
      const msg = error.message || "Failed to create coupon";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ coupon });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

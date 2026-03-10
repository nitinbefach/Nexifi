import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { success } = rateLimit(`coupon:${ip}`, { limit: 20, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { code, subtotal } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    // Date range check
    const now = new Date();
    if (coupon.valid_from && now < new Date(coupon.valid_from)) {
      return NextResponse.json({ error: "This coupon is not yet active" }, { status: 400 });
    }
    if (coupon.valid_until && now > new Date(coupon.valid_until)) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    // Usage limit check
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    // Minimum order amount check
    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      return NextResponse.json(
        { error: `Minimum order amount is ₹${coupon.min_order_amount}` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = coupon.discount_value;
    }
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: Math.round(discount * 100) / 100,
      description: coupon.description,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStoreSettingsMap, createNotificationEntry } from "@/lib/supabase/admin-queries";
import { createOrderSchema } from "@/validators/order.schema";
import { createPhonePeOrder } from "@/lib/phonepe";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { success } = rateLimit(`phonepe:${ip}`, { limit: 10, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 1. Validate request body (same schema as COD orders)
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      guest_name,
      guest_email,
      guest_phone,
      shipping_address,
      items,
      coupon_code,
      notes,
    } = parsed.data;

    // 2. Validate stock
    const productIds = items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, stock_quantity, selling_price, is_active")
      .in("id", productIds);

    if (productsError || !products) {
      return NextResponse.json(
        { error: "Failed to verify product availability" },
        { status: 500 }
      );
    }

    const stockErrors: string[] = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.is_active) {
        stockErrors.push(`${item.name} is no longer available`);
      } else if (product.stock_quantity < item.quantity) {
        stockErrors.push(
          `${item.name} only has ${product.stock_quantity} in stock (you requested ${item.quantity})`
        );
      }
    }

    if (stockErrors.length > 0) {
      return NextResponse.json(
        { error: "Some items are out of stock", stockErrors },
        { status: 409 }
      );
    }

    // 3. Calculate totals (server-side prices)
    const settings = await getStoreSettingsMap();
    const FREE_SHIPPING_THRESHOLD = Number(settings.free_shipping_threshold) || 499;
    const GST_PERCENT = Number(settings.gst_percent) || 18;
    const SHIPPING_CHARGE = Number(settings.shipping_charge) || 49;

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const dbProduct = products.find((p) => p.id === item.productId)!;
      const unitPrice = dbProduct.selling_price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      return {
        product_id: item.productId,
        variant_id: item.variantId || null,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      };
    });

    const shippingCharge =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
    const codCharge = 0; // No COD charge for online payments

    // Coupon discount
    let discountAmount = 0;
    if (coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", coupon_code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (coupon) {
        const now = new Date();
        const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null;
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
        const withinDateRange =
          (!validFrom || now >= validFrom) && (!validUntil || now <= validUntil);
        const withinUsageLimit =
          !coupon.usage_limit || coupon.used_count < coupon.usage_limit;
        const meetsMinOrder = subtotal >= (coupon.min_order_amount || 0);

        if (withinDateRange && withinUsageLimit && meetsMinOrder) {
          if (coupon.discount_type === "percentage") {
            discountAmount = (subtotal * coupon.discount_value) / 100;
            if (coupon.max_discount_amount) {
              discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
            }
          } else {
            discountAmount = coupon.discount_value;
          }
          discountAmount = Math.min(discountAmount, subtotal);
        }
      }
    }

    const taxableAmount = subtotal - discountAmount;
    const gstAmount = Math.round(((taxableAmount * GST_PERCENT) / 100) * 100) / 100;
    const totalAmount =
      Math.round((subtotal - discountAmount + shippingCharge + codCharge + gstAmount) * 100) / 100;

    // 4. Create order with payment_status: "pending"
    const { data: result, error: txError } = await supabaseAdmin.rpc(
      "create_order_transaction",
      {
        p_order_data: {
          subtotal,
          discount_amount: discountAmount,
          shipping_charge: shippingCharge,
          gst_amount: gstAmount,
          total_amount: totalAmount,
          coupon_code: coupon_code?.toUpperCase() || null,
          payment_method: "online",
          cod_charge: codCharge,
          guest_name,
          guest_email,
          guest_phone,
          shipping_address,
          notes: notes || null,
        },
        p_items: orderItems,
        p_coupon_code:
          coupon_code && discountAmount > 0 ? coupon_code.toUpperCase() : null,
      }
    );

    if (txError) {
      console.error("Order transaction failed:", txError.message);
      if (txError.message?.includes("Insufficient stock")) {
        return NextResponse.json({ error: txError.message }, { status: 409 });
      }
      return NextResponse.json(
        { error: "Failed to create order. Please try again." },
        { status: 500 }
      );
    }

    // 5. Create PhonePe payment
    const phonePeResult = await createPhonePeOrder({
      amount: totalAmount,
      orderId: result.order_id,
      customerPhone: guest_phone,
      customerEmail: guest_email,
    });

    if (!phonePeResult.success) {
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", result.order_id);

      return NextResponse.json(
        { error: phonePeResult.error || "Failed to initiate payment" },
        { status: 502 }
      );
    }

    // Store the PhonePe transaction ID for verification
    await supabaseAdmin
      .from("orders")
      .update({ phonepe_transaction_id: phonePeResult.merchantTransactionId })
      .eq("id", result.order_id);

    // Log notification entry
    await createNotificationEntry({
      order_id: result.order_id,
      channel: "email",
      type: "order_confirmation",
      status: "pending",
      metadata: { guest_email, order_number: result.order_number },
    }).catch(() => {});

    return NextResponse.json({
      order_id: result.order_id,
      order_number: result.order_number,
      total_amount: totalAmount,
      redirectUrl: phonePeResult.redirectUrl,
      merchantTransactionId: phonePeResult.merchantTransactionId,
    });
  } catch (error) {
    console.error("PhonePe order creation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

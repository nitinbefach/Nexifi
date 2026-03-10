import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStoreSettingsMap } from "@/lib/supabase/admin-queries";
import { createOrderSchema } from "@/validators/order.schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate request body
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
      payment_method,
      items,
      coupon_code,
      notes,
    } = parsed.data;

    // 2. Validate stock for all items
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

    // Check each item has stock
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

    // Load store settings from DB
    const settings = await getStoreSettingsMap();
    const COD_CHARGE = Number(settings.cod_charge) || 49;
    const FREE_SHIPPING_THRESHOLD = Number(settings.free_shipping_threshold) || 499;
    const GST_PERCENT = Number(settings.gst_percent) || 18;
    const COD_MAX_AMOUNT = Number(settings.cod_max_amount) || 5000;

    // 3. Calculate totals (use server-side prices, not client-sent)
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

    // Shipping: free above threshold
    const SHIPPING_CHARGE = Number(settings.shipping_charge) || 49;
    const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;

    // COD charge
    let codCharge = 0;
    if (payment_method === "cod") {
      if (subtotal > COD_MAX_AMOUNT) {
        return NextResponse.json(
          { error: `COD is not available for orders above ₹${COD_MAX_AMOUNT}` },
          { status: 400 }
        );
      }
      codCharge = COD_CHARGE;
    }

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
          discountAmount = Math.min(discountAmount, subtotal); // can't exceed subtotal
        }
      }
    }

    // GST on (subtotal - discount)
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = Math.round(((taxableAmount * GST_PERCENT) / 100) * 100) / 100;

    // Total
    const totalAmount =
      Math.round((subtotal - discountAmount + shippingCharge + codCharge + gstAmount) * 100) / 100;

    // 4. Create order atomically (single transaction via RPC)
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
          payment_method,
          cod_charge: codCharge,
          guest_name,
          guest_email,
          guest_phone,
          shipping_address,
          notes: notes || null,
        },
        p_items: orderItems,
        p_coupon_code:
          coupon_code && discountAmount > 0
            ? coupon_code.toUpperCase()
            : null,
      }
    );

    if (txError) {
      console.error("Order transaction failed:", txError.message);
      // Check for stock-related errors
      if (txError.message?.includes("Insufficient stock")) {
        return NextResponse.json(
          { error: txError.message },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create order. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order_id: result.order_id,
      order_number: result.order_number,
      total_amount: totalAmount,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

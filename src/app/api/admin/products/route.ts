import { NextRequest, NextResponse } from "next/server";
import { createProduct } from "@/lib/supabase/admin-queries";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, slug, description, short_description,
      category_id, original_price, selling_price,
      sku, stock_quantity, is_active, is_featured, is_trending,
    } = body;

    if (!name || !slug || !selling_price) {
      return NextResponse.json(
        { error: "Name, slug, and selling price are required" },
        { status: 400 }
      );
    }

    const { product, error } = await createProduct({
      name,
      slug,
      description: description || null,
      short_description: short_description || null,
      category_id: category_id || null,
      original_price: original_price || selling_price,
      selling_price,
      sku: sku || null,
      stock_quantity: stock_quantity ?? 0,
      is_active: is_active ?? true,
      is_featured: is_featured ?? false,
      is_trending: is_trending ?? false,
    });

    if (error) {
      const msg = error.message || "Failed to create product";
      const status = msg.includes("duplicate") ? 409 : 500;
      return NextResponse.json({ error: msg }, { status });
    }

    // Save product images if provided
    const images = body.images as { image_url: string; is_primary: boolean; sort_order: number }[] | undefined;
    if (images && images.length > 0 && product) {
      await supabaseAdmin.from("product_images").insert(
        images.map((img) => ({
          product_id: product.id,
          image_url: img.image_url,
          is_primary: img.is_primary,
          sort_order: img.sort_order,
        }))
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

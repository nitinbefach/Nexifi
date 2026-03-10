import { NextRequest, NextResponse } from "next/server";
import { updateProduct, deleteProduct } from "@/lib/supabase/admin-queries";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      "name", "slug", "description", "short_description",
      "category_id", "original_price", "selling_price",
      "sku", "stock_quantity", "is_active", "is_featured", "is_trending",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { product, error } = await updateProduct(id, updateData);

    if (error) {
      const msg = error.message || "Failed to update product";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Sync product images if provided
    const images = body.images as { image_url: string; is_primary: boolean; sort_order: number }[] | undefined;
    if (images !== undefined) {
      // Delete existing images and re-insert
      await supabaseAdmin.from("product_images").delete().eq("product_id", id);
      if (images.length > 0) {
        await supabaseAdmin.from("product_images").insert(
          images.map((img) => ({
            product_id: id,
            image_url: img.image_url,
            is_primary: img.is_primary,
            sort_order: img.sort_order,
          }))
        );
      }
    }

    return NextResponse.json({ product });
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
  const { error } = await deleteProduct(id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

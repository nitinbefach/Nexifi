import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/supabase/admin-queries";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, sort_order, is_active } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { category, error } = await updateCategory(id, updateData);

    if (error) {
      const msg = error.message || "Failed to update category";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Sync product assignments if product_ids provided
    const product_ids = body.product_ids as string[] | undefined;
    if (product_ids !== undefined) {
      // Remove this category from all products that currently have it
      await supabaseAdmin
        .from("products")
        .update({ category_id: null })
        .eq("category_id", id);

      // Assign this category to selected products
      if (product_ids.length > 0) {
        await supabaseAdmin
          .from("products")
          .update({ category_id: id })
          .in("id", product_ids);
      }
    }

    return NextResponse.json({ category });
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
  const { error } = await deleteCategory(id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

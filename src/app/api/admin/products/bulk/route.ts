import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteProduct } from "@/lib/supabase/admin-queries";

interface BulkBody {
  ids: string[];
  action: "archive" | "unarchive" | "delete" | "change-category";
  category_id?: string;
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as BulkBody;
    const { ids, action, category_id } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids must be a non-empty array" },
        { status: 400 }
      );
    }

    if (ids.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 products per bulk action" },
        { status: 400 }
      );
    }

    if (!["archive", "unarchive", "delete", "change-category"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    switch (action) {
      case "archive": {
        const { error } = await supabaseAdmin
          .from("products")
          .update({ is_active: false })
          .in("id", ids);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        break;
      }
      case "unarchive": {
        const { error } = await supabaseAdmin
          .from("products")
          .update({ is_active: true })
          .in("id", ids);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        break;
      }
      case "delete": {
        const errors: string[] = [];
        for (const id of ids) {
          const { error } = await deleteProduct(id);
          if (error) errors.push(`${id}: ${error.message}`);
        }
        if (errors.length > 0) {
          return NextResponse.json(
            { error: `Failed to delete some products: ${errors.join(", ")}` },
            { status: 500 }
          );
        }
        break;
      }
      case "change-category": {
        if (!category_id) {
          return NextResponse.json(
            { error: "category_id is required for change-category action" },
            { status: 400 }
          );
        }
        const { error } = await supabaseAdmin
          .from("products")
          .update({ category_id })
          .in("id", ids);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        break;
      }
    }

    return NextResponse.json({ success: true, affected: ids.length });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

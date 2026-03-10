import { NextRequest, NextResponse } from "next/server";
import { createCategory } from "@/lib/supabase/admin-queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, sort_order } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const { category, error } = await createCategory({
      name,
      slug,
      description: description || null,
      sort_order: sort_order ?? 0,
    });

    if (error) {
      const msg = error.message || "Failed to create category";
      const status = msg.includes("duplicate") ? 409 : 500;
      return NextResponse.json({ error: msg }, { status });
    }

    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

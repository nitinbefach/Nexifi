import { NextRequest, NextResponse } from "next/server";
import { createBanner } from "@/lib/supabase/admin-queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, image_url, mobile_image_url, link_url, sort_order, is_active } = body;

    if (!image_url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const { banner, error } = await createBanner({
      title: title || null,
      image_url,
      mobile_image_url: mobile_image_url || null,
      link_url: link_url || null,
      sort_order: sort_order ?? 0,
      is_active: is_active ?? true,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to create banner" },
        { status: 500 }
      );
    }

    return NextResponse.json({ banner });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

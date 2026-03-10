import { NextRequest, NextResponse } from "next/server";
import { updateStoreSettings } from "@/lib/supabase/admin-queries";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = body.settings as { key: string; value: unknown }[];

    if (!Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json(
        { error: "No settings provided" },
        { status: 400 }
      );
    }

    const { error } = await updateStoreSettings(settings);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

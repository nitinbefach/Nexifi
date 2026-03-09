import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "WhatsApp notification handler — not yet implemented" },
    { status: 501 }
  );
}

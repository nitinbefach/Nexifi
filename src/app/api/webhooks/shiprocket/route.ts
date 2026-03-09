import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "Shiprocket webhook handler — not yet implemented" },
    { status: 501 }
  );
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "Pincode serviceability check — not yet implemented" },
    { status: 501 }
  );
}

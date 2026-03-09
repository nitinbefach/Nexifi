import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "Refund processing handler — not yet implemented" },
    { status: 501 }
  );
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: "Excel template download — not yet implemented" },
    { status: 501 }
  );
}

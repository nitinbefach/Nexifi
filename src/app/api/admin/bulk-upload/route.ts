import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "Excel bulk upload handler — not yet implemented" },
    { status: 501 }
  );
}

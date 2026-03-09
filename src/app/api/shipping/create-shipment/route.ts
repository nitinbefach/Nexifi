import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "Create shipment handler — not yet implemented" },
    { status: 501 }
  );
}

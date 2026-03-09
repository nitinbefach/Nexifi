import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "Razorpay order creation — Sprint 4" },
    { status: 501 }
  );
}

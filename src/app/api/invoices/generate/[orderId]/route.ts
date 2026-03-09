import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  return NextResponse.json(
    { message: `Invoice generation for order ${orderId} — not yet implemented` },
    { status: 501 }
  );
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ awb: string }> }
) {
  const { awb } = await params;
  return NextResponse.json(
    { message: `Shipment tracking for AWB ${awb} — not yet implemented` },
    { status: 501 }
  );
}

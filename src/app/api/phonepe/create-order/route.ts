import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "PhonePe payment integration — coming soon. Use COD for now." },
    { status: 501 }
  );
}

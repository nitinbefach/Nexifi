import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "PhonePe payment verification — coming soon." },
    { status: 501 }
  );
}

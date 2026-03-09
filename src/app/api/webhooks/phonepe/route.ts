import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "PhonePe webhook — coming soon." },
    { status: 501 }
  );
}

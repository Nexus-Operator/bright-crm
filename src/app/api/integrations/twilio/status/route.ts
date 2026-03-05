import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isTwilioConfigured } from "@/lib/twilio";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      configured: isTwilioConfigured(),
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || null,
    });
  } catch (error) {
    console.error("Twilio status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check Twilio status" },
      { status: 500 }
    );
  }
}

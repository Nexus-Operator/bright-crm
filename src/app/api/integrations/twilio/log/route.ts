import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCallLog, getSmsLog, isTwilioConfigured } from "@/lib/twilio";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isTwilioConfigured()) {
      return NextResponse.json(
        { error: "Twilio is not configured" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "calls";
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    let log;
    if (type === "sms") {
      log = await getSmsLog(limit);
    } else {
      log = await getCallLog(limit);
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error("Twilio log error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch log" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendSms } from "@/lib/dialpad";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { toNumber, text, fromNumber } = body;

    if (!toNumber || !text) {
      return NextResponse.json(
        { error: "toNumber and text are required" },
        { status: 400 }
      );
    }

    const result = await sendSms(session.user.id, toNumber, text, fromNumber);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Dialpad SMS error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send SMS" },
      { status: 500 }
    );
  }
}

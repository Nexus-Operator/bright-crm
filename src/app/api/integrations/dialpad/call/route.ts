import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { initiateCall } from "@/lib/dialpad";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phoneNumber, customData } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "phoneNumber is required" },
        { status: 400 }
      );
    }

    const result = await initiateCall(session.user.id, phoneNumber, {
      customData,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Dialpad call error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initiate call" },
      { status: 500 }
    );
  }
}

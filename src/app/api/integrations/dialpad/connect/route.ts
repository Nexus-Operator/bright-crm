import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDialpadAuthUrl, isDialpadConfigured } from "@/lib/dialpad";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isDialpadConfigured()) {
      return NextResponse.json(
        { error: "Dialpad OAuth credentials are not configured" },
        { status: 400 }
      );
    }

    const url = getDialpadAuthUrl(session.user.id);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Dialpad connect error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate auth URL" },
      { status: 500 }
    );
  }
}

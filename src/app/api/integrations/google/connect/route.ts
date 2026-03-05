import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthUrl } from "@/lib/google";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "Google OAuth credentials are not configured" },
        { status: 400 }
      );
    }

    const authUrl = getAuthUrl(session.user.id);

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Google connect error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate auth URL" },
      { status: 500 }
    );
  }
}

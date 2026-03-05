import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listEmails } from "@/lib/google";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q") || undefined;
    const max = parseInt(searchParams.get("max") || "20", 10);

    const messages = await listEmails(session.user.id, q, max);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Gmail list error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list emails" },
      { status: 500 }
    );
  }
}

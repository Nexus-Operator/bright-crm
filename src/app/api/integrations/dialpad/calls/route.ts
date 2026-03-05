import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listCalls } from "@/lib/dialpad";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const result = await listCalls(session.user.id, {
      limit: limit ? parseInt(limit, 10) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Dialpad list calls error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list calls" },
      { status: 500 }
    );
  }
}

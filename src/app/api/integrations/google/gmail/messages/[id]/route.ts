import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getEmailDetail } from "@/lib/google";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const message = await getEmailDetail(session.user.id, id);

    return NextResponse.json(message);
  } catch (error) {
    console.error("Gmail detail error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get email detail" },
      { status: 500 }
    );
  }
}

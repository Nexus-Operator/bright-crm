import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteCalendarEvent } from "@/lib/google";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteCalendarEvent(session.user.id, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Calendar delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete calendar event" },
      { status: 500 }
    );
  }
}

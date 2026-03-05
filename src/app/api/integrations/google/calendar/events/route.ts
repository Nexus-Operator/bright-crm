import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listCalendarEvents, createCalendarEvent } from "@/lib/google";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const timeMin = searchParams.get("timeMin") || undefined;
    const timeMax = searchParams.get("timeMax") || undefined;
    const max = parseInt(searchParams.get("max") || "20", 10);

    const events = await listCalendarEvents(
      session.user.id,
      timeMin,
      timeMax,
      max
    );

    return NextResponse.json(events);
  } catch (error) {
    console.error("Calendar list error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list calendar events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      summary,
      description,
      location,
      startDateTime,
      endDateTime,
      attendeeEmails,
      contactId,
      dealId,
    } = await request.json();

    if (!summary || !startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: "summary, startDateTime, and endDateTime are required" },
        { status: 400 }
      );
    }

    const event = await createCalendarEvent(session.user.id, {
      summary,
      description,
      location,
      startDateTime,
      endDateTime,
      attendeeEmails,
    });

    // Log activity if linked to a CRM record
    if (contactId || dealId) {
      await prisma.activity.create({
        data: {
          type: "meeting",
          subject: summary,
          status: "Open",
          dueDate: new Date(startDateTime),
          contactId: contactId || null,
          dealId: dealId || null,
          ownerId: session.user.id,
        },
      });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Calendar create error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create calendar event" },
      { status: 500 }
    );
  }
}

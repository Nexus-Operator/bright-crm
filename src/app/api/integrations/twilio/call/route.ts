import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { makeCall, isTwilioConfigured } from "@/lib/twilio";

export async function POST(request: Request) {
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

    const { to, contactId, dealId, leadId } = await request.json();

    if (!to) {
      return NextResponse.json(
        { error: "Missing required field: to" },
        { status: 400 }
      );
    }

    const result = await makeCall(to);

    if (contactId || dealId || leadId) {
      await prisma.activity.create({
        data: {
          type: "call",
          subject: `Call to ${to}`,
          status: "Completed",
          ...(contactId && { contactId }),
          ...(dealId && { dealId }),
          ...(leadId && { leadId }),
          ownerId: session.user.id,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Twilio call error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to make call" },
      { status: 500 }
    );
  }
}

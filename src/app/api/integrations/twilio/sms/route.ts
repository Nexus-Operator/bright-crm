import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSms, isTwilioConfigured } from "@/lib/twilio";

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

    const { to, body, contactId, dealId, leadId } = await request.json();

    if (!to || !body) {
      return NextResponse.json(
        { error: "Missing required fields: to, body" },
        { status: 400 }
      );
    }

    const result = await sendSms(to, body);

    if (contactId || dealId || leadId) {
      await prisma.activity.create({
        data: {
          type: "sms",
          subject: `SMS to ${to}`,
          description: body,
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
    console.error("Twilio SMS error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send SMS" },
      { status: 500 }
    );
  }
}

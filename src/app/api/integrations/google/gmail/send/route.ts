import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/google";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to, subject, body, htmlBody, contactId, dealId, leadId } =
      await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "to, subject, and body are required" },
        { status: 400 }
      );
    }

    const message = await sendEmail(
      session.user.id,
      to,
      subject,
      body,
      htmlBody
    );

    // Log activity if linked to a CRM record
    if (contactId || dealId || leadId) {
      await prisma.activity.create({
        data: {
          type: "email",
          subject,
          status: "Completed",
          contactId: contactId || null,
          dealId: dealId || null,
          leadId: leadId || null,
          ownerId: session.user.id,
        },
      });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Gmail send error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}

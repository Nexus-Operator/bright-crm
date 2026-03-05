import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: { userId: session.user.id, provider: "google" },
      },
      select: { email: true, refreshToken: true },
    });

    return NextResponse.json({
      connected: !!integration?.refreshToken,
      email: integration?.email || null,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

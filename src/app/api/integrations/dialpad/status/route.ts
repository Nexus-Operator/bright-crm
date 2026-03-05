import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDialpadConfigured, getDialpadMiniDialerUrl } from "@/lib/dialpad";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const configured = isDialpadConfigured();

    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: { userId: session.user.id, provider: "dialpad" },
      },
      select: { accessToken: true },
    });

    return NextResponse.json({
      connected: !!integration?.accessToken,
      configured,
      miniDialerUrl: getDialpadMiniDialerUrl(),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

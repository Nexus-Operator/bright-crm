import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.integration.deleteMany({
      where: {
        userId: session.user.id,
        provider: "dialpad",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dialpad disconnect error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to disconnect Dialpad" },
      { status: 500 }
    );
  }
}

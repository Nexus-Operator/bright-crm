import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pipelines = await prisma.pipeline.findMany({
      include: {
        stages: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(pipelines);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const pipeline = await prisma.pipeline.create({
      data: {
        name: body.name,
        isDefault: false,
      },
      include: {
        stages: true,
      },
    });

    return NextResponse.json(pipeline, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

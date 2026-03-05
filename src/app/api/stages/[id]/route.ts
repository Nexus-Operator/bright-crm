import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateStageSchema = z.object({
  name: z.string().min(1, "Stage name is required").optional(),
  order: z.number().int().min(0).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.stage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Stage not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = updateStageSchema.parse(body);

    const stage = await prisma.stage.update({
      where: { id },
      data,
    });

    return NextResponse.json(stage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const existing = await prisma.stage.findUnique({
      where: { id },
      include: { _count: { select: { deals: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Stage not found" },
        { status: 404 }
      );
    }

    if (existing._count.deals > 0) {
      return NextResponse.json(
        { error: "Cannot delete stage with existing deals. Move deals to another stage first." },
        { status: 400 }
      );
    }

    await prisma.stage.delete({ where: { id } });

    return NextResponse.json({ message: "Stage deleted" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

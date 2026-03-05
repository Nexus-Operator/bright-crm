import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updatePipelineSchema = z.object({
  name: z.string().min(1, "Pipeline name is required"),
  isDefault: z.boolean().optional(),
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

    const existing = await prisma.pipeline.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = updatePipelineSchema.parse(body);

    // If setting as default, unset other defaults first
    if (data.isDefault) {
      await prisma.pipeline.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const pipeline = await prisma.pipeline.update({
      where: { id },
      data: {
        name: data.name,
        isDefault: data.isDefault ?? existing.isDefault,
      },
      include: {
        stages: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json(pipeline);
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

    const existing = await prisma.pipeline.findUnique({
      where: { id },
      include: { _count: { select: { deals: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    if (existing._count.deals > 0) {
      return NextResponse.json(
        { error: "Cannot delete pipeline with existing deals. Move or delete deals first." },
        { status: 400 }
      );
    }

    if (existing.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete the default pipeline. Set another pipeline as default first." },
        { status: 400 }
      );
    }

    await prisma.pipeline.delete({ where: { id } });

    return NextResponse.json({ message: "Pipeline deleted" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createStageSchema = z.object({
  name: z.string().min(1, "Stage name is required"),
  order: z.number().int().min(0),
  probability: z.number().int().min(0).max(100).default(0),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").default("#3B82F6"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const pipeline = await prisma.pipeline.findUnique({ where: { id } });
    if (!pipeline) {
      return NextResponse.json(
        { error: "Pipeline not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = createStageSchema.parse(body);

    const stage = await prisma.stage.create({
      data: {
        name: data.name,
        order: data.order,
        probability: data.probability,
        color: data.color,
        pipelineId: id,
      },
    });

    return NextResponse.json(stage, { status: 201 });
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

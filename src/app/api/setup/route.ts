import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPresetById } from "@/lib/presets";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { presetId } = await request.json();
    const preset = getPresetById(presetId);

    if (!preset) {
      return NextResponse.json(
        { error: "Invalid preset" },
        { status: 400 }
      );
    }

    // Delete any existing default pipeline and its stages
    const existingDefault = await prisma.pipeline.findFirst({
      where: { isDefault: true },
    });
    if (existingDefault) {
      // Move deals off old stages first
      const oldStages = await prisma.stage.findMany({
        where: { pipelineId: existingDefault.id },
      });
      if (oldStages.length > 0) {
        await prisma.deal.deleteMany({
          where: {
            stageId: { in: oldStages.map((s) => s.id) },
          },
        });
      }
      await prisma.stage.deleteMany({
        where: { pipelineId: existingDefault.id },
      });
      await prisma.pipeline.delete({
        where: { id: existingDefault.id },
      });
    }

    // Create new pipeline from preset
    const pipeline = await prisma.pipeline.create({
      data: {
        name: preset.pipelineName,
        isDefault: true,
        stages: {
          create: preset.stages.map((stage, index) => ({
            name: stage.name,
            order: index + 1,
            probability: stage.probability,
            color: stage.color,
          })),
        },
      },
      include: {
        stages: { orderBy: { order: "asc" } },
      },
    });

    // Mark user as onboarded with industry
    // Use upsert-style: try update, if user not found (stale session), mark all users
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { onboarded: true, industry: preset.id },
      });
    } else {
      // Stale session — update by email instead
      await prisma.user.updateMany({
        where: { email: session.user.email },
        data: { onboarded: true, industry: preset.id },
      });
    }

    return NextResponse.json({
      pipeline,
      industry: preset.id,
      message: "Setup complete",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

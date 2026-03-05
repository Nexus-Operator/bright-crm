import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LeadDetailForm from "./LeadDetailForm";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      activities: {
        include: { owner: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      notes: {
        include: { owner: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!lead) {
    notFound();
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Serialize dates for client component
  const serializedLead = {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    activities: lead.activities.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      dueDate: a.dueDate?.toISOString() || null,
    })),
    notes: lead.notes.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    })),
  };

  return <LeadDetailForm lead={serializedLead} users={users} />;
}

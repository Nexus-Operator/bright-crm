import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import AccountDetailClient from "./AccountDetailClient";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      contacts: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          title: true,
        },
        orderBy: { lastName: "asc" },
      },
      deals: {
        select: {
          id: true,
          name: true,
          amount: true,
          closeDate: true,
          stage: { select: { name: true, color: true } },
          owner: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!account) notFound();

  return <AccountDetailClient account={JSON.parse(JSON.stringify(account))} />;
}

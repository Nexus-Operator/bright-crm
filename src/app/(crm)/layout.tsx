import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SessionProvider } from "next-auth/react";
import CrmShell from "./CrmShell";

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has completed onboarding
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true },
  });

  if (!user?.onboarded) {
    redirect("/setup");
  }

  return (
    <SessionProvider session={session}>
      <CrmShell userName={session.user.name || session.user.email}>
        {children}
      </CrmShell>
    </SessionProvider>
  );
}

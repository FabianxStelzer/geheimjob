import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user.role;

  let unread = 0;
  if (session?.user.id) {
    unread = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    });
  }

  return (
    <DashboardShell role={role} email={session?.user.email} unread={unread}>
      {children}
    </DashboardShell>
  );
}

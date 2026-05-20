import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard-nav";

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
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="shrink-0 border-slate-800 bg-slate-900 md:min-h-screen md:w-64 md:border-r">
        <div className="p-6 md:sticky md:top-0 md:max-h-screen md:overflow-y-auto">
          <DashboardNav role={role} email={session?.user.email} unread={unread} />
        </div>
      </aside>

      <section className="min-w-0 flex-1 p-4 md:p-10">
        <div className="gj-card min-h-[calc(100vh-8rem)] rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-10">
          {children}
        </div>
      </section>
    </div>
  );
}

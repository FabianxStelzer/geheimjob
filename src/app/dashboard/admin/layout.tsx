import { auth } from "@/auth";
import { AdminNav } from "@/components/admin-nav";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gj-primary)]">
          Super-Admin
        </p>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Verwaltung von Unternehmen, Paketen, Abonnements und der gesamten Plattform.
        </p>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}

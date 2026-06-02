import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountNameForm } from "@/components/account-name-form";
import { DeleteAccountButton } from "@/components/delete-account-button";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const role = session.user.role;
  let displayName = "";
  let nameLabel = "Name";

  if (role === "WORKER") {
    const profile = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
      select: { displayName: true },
    });
    displayName = profile?.displayName ?? "";
    nameLabel = "Anzeigename (intern)";
  } else if (role === "EMPLOYER") {
    const profile = await prisma.employerProfile.findUnique({
      where: { userId: session.user.id },
      select: { contactName: true },
    });
    displayName = profile?.contactName ?? "";
    nameLabel = "Ansprechpartner";
  }

  const profileHref =
    role === "WORKER"
      ? "/dashboard/worker/profil"
      : role === "EMPLOYER"
        ? "/dashboard/employer/profil"
        : "/dashboard/admin";

  return (
    <div className="space-y-6">
      <section className="gj-card p-6">
        <h2 className="text-base font-semibold">Konto</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-[var(--gj-border)] pb-3">
            <dt className="text-[var(--gj-muted)]">E-Mail</dt>
            <dd className="font-medium text-[var(--gj-text)]">{session.user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--gj-muted)]">Rolle</dt>
            <dd className="font-medium text-[var(--gj-text)]">{role ?? "—"}</dd>
          </div>
        </dl>
        {role === "WORKER" || role === "EMPLOYER" ? (
          <AccountNameForm defaultName={displayName} label={nameLabel} />
        ) : null}
      </section>

      <section className="gj-card p-6">
        <h2 className="text-base font-semibold">Profil &amp; Datenschutz</h2>
        <p className="mt-2 text-sm text-[var(--gj-muted)]">
          Weitere Profildaten bearbeiten oder rechtliche Informationen einsehen.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={profileHref} className="gj-btn-ghost text-sm">
            Zum Profil
          </Link>
          <Link href="/datenschutz" className="gj-btn-ghost text-sm">
            Datenschutzerklärung
          </Link>
          <Link href="/agb" className="gj-btn-ghost text-sm">
            Nutzungsbedingungen
          </Link>
          <Link href="/dashboard/support" className="gj-btn-ghost text-sm">
            Support-Center
          </Link>
        </div>
      </section>

      <section className="gj-card border-rose-100 p-6">
        <h2 className="text-base font-semibold text-rose-700">Konto löschen</h2>
        <p className="mt-2 text-sm text-[var(--gj-muted)]">
          Ihr Zugang wird deaktiviert und personenbezogene Daten werden gemäß Datenschutzerklärung
          bereinigt. Dieser Schritt kann nicht rückgängig gemacht werden.
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}

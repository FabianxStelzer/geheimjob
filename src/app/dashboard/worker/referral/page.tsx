import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GiftIcon, UsersIcon } from "@/components/icons";
import { CopyButton } from "@/components/copy-button";

export default async function ReferralPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const referrals = await prisma.referralReward.findMany({
    where: { referrerUserId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const base = process.env.NEXTAUTH_URL ?? "";
  const referralLink = `${base}/register/arbeitnehmer?ref=${user?.referralCode ?? ""}`;

  return (
    <div className="space-y-6">
      <section className="gj-card overflow-hidden">
        <div className="relative gj-gradient-primary p-8 text-white">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <GiftIcon className="h-6 w-6 text-white" />
            </span>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold">Empfehlen &amp; Bonus erhalten</h2>
              <p className="mt-2 max-w-xl text-sm text-white/85">
                Teilen Sie Ihren persönlichen Link mit Kolleg:innen. Sobald sie sich registrieren,
                wird ein Bonus auf Ihr Konto vermerkt.
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="gj-label">Ihr persönlicher Link</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="flex-1 min-w-0 truncate rounded-lg border border-[var(--gj-border)] bg-[var(--gj-bg)] px-3 py-2 text-sm text-[var(--gj-text)]">
              {referralLink}
            </code>
            <CopyButton text={referralLink} />
          </div>
        </div>
      </section>

      <section className="gj-card p-6">
        <header className="mb-4 flex items-center gap-2">
          <UsersIcon />
          <h3 className="text-base font-semibold">Ihre Empfehlungen</h3>
          <span className="text-xs text-[var(--gj-muted)]">{referrals.length}</span>
        </header>
        {referrals.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--gj-border-strong)] p-6 text-center text-sm text-[var(--gj-muted)]">
            Noch keine geworbenen Personen.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--gj-border)]">
            {referrals.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div className="text-sm">
                  <p className="font-medium text-[var(--gj-text)]">{r.referredUserId.slice(0, 12)}…</p>
                  <p className="text-xs text-[var(--gj-muted)]">{r.createdAt.toLocaleDateString("de-DE")}</p>
                </div>
                <span className="gj-chip gj-chip-success">{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}


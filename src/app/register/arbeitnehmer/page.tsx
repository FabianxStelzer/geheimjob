import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { RegisterWorkerForm } from "./register-worker-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--gj-bg)] px-4 py-10 sm:px-6">
      <div className="mx-auto mb-8 flex w-full max-w-lg items-center justify-between gap-4">
        <Link href="/login" className="text-sm font-medium text-[var(--gj-primary)] hover:text-[var(--gj-primary-hover)]">
          ← Zur Anmeldung
        </Link>
        <BrandLogo className="text-sm min-w-[100px]" />
      </div>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6">
        <div className="text-center">
          <h1 className="text-[28px] font-bold leading-tight text-[var(--gj-text)]">Arbeitnehmer-Registrierung</h1>
          <p className="mt-3 text-sm text-[var(--gj-muted)]">
            Diskretes Profil mit Kontrollmechanismen. Referral per Link{" "}
            <code className="rounded-md bg-[var(--gj-primary-soft)] px-1.5 py-0.5 text-xs text-[var(--gj-primary-hover)]">
              ?ref=…
            </code>
            .
          </p>
        </div>
        <RegisterWorkerForm referralCode={sp.ref} />
      </main>
    </div>
  );
}

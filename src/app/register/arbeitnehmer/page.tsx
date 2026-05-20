import { RegisterWorkerForm } from "./register-worker-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Arbeitnehmer-Registrierung</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Diskretes Profil mit Kontrollmechanismen. Referral-Code: automatisch aus Link{" "}
          <code className="rounded bg-zinc-100 px-1">?ref=…</code>.
        </p>
      </div>
      <RegisterWorkerForm referralCode={sp.ref} />
    </main>
  );
}

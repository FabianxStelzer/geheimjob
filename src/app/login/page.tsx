import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Login</h1>
        {sp.registered === "1" ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Registrierung erfolgreich — Sie können sich jetzt anmelden.
          </p>
        ) : null}
      </div>
      <LoginForm />
    </main>
  );
}

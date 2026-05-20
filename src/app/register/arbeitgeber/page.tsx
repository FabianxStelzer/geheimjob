import { RegisterEmployerForm } from "./register-employer-form";

export default function Page() {
  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Arbeitgeber-Registrierung</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Legen Sie Ihr Unternehmensprofil an und kontaktieren Sie passende Kandidaten nach
          vorheriger Freigabe.
        </p>
      </div>
      <RegisterEmployerForm />
    </main>
  );
}

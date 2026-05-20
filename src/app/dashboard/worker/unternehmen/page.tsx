import { EmployerBrowsePanel } from "@/components/employer-browse-panel";

export default function WorkerEmployersPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Unternehmen entdecken</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Sie können ebenfalls Interesse bekunden — die andere Partei muss den Match bestätigen.
        </p>
      </header>
      <EmployerBrowsePanel />
    </div>
  );
}

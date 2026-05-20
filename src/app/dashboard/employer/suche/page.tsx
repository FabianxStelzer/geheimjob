import { WorkerSearchPanel } from "@/components/worker-search-panel";

export default function EmployerSearchPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Kandidaten-Suche</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Ausschlüsse und Sichtbarkeit respektiert das System automatisch.
        </p>
      </header>
      <WorkerSearchPanel />
    </div>
  );
}

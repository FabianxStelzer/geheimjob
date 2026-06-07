export function AdminDataSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="gj-card p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function AdminFieldGrid({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="rounded-lg border border-[var(--gj-border)] bg-[var(--gj-bg)]/40 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-[var(--gj-muted)]">
            {row.label}
          </dt>
          <dd className="mt-1 text-sm text-[var(--gj-text)]">{row.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

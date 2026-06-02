"use client";

import type { JobPostingStats } from "@/lib/job-posting-stats";

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        accent
          ? "border-[var(--gj-primary)]/30 bg-[var(--gj-primary-softer)]/50"
          : "border-[var(--gj-border)] bg-[var(--gj-bg)]/40"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--gj-muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--gj-text)]">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-[var(--gj-muted)]">{hint}</p> : null}
    </div>
  );
}

export function JobStatsGrid({ stats }: { stats: JobPostingStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard label="Aufrufe gesamt" value={stats.detailViewCount} hint="Detail-Ansichten" />
      <StatCard
        label="Unique Besucher"
        value={stats.uniqueViewCount}
        hint="Verschiedene Kandidaten"
        accent
      />
      <StatCard label="Bewerbungen" value={stats.applicationsTotal} hint="Alle eingegangen" accent />
      <StatCard label="Offen" value={stats.applicationsPending} />
      <StatCard label="Angenommen" value={stats.applicationsAccepted} />
      <StatCard
        label="Conversion"
        value={stats.conversionRate != null ? `${stats.conversionRate} %` : "—"}
        hint="Bewerbungen / Unique"
      />
    </div>
  );
}

export function JobStatsCompact({ stats }: { stats: JobPostingStats }) {
  return (
    <div className="flex flex-wrap gap-2">
      <MetricPill label="Aufrufe" value={stats.detailViewCount} />
      <MetricPill label="Unique" value={stats.uniqueViewCount} />
      <MetricPill label="Bewerbungen" value={stats.applicationsTotal} highlight />
      <MetricPill label="Offen" value={stats.applicationsPending} />
      <MetricPill label="Angenommen" value={stats.applicationsAccepted} />
      {stats.conversionRate != null ? (
        <MetricPill label="Conversion" value={`${stats.conversionRate} %`} />
      ) : null}
    </div>
  );
}

function MetricPill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
        highlight
          ? "bg-[var(--gj-primary-softer)] font-semibold text-[var(--gj-primary)]"
          : "bg-[var(--gj-bg)] text-[var(--gj-text-secondary)]"
      }`}
    >
      <span className="text-[var(--gj-muted)]">{label}</span>
      <span className="tabular-nums">{value}</span>
    </span>
  );
}

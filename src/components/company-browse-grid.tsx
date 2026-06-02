"use client";

import Link from "next/link";
import { BrandAvatar } from "@/components/brand-logo";
import { BriefcaseIcon, MapPinIcon } from "@/components/icons";

export type CompanyBrowseItem = {
  id: string;
  publicSlug: string;
  companyName: string;
  industry: string;
  region: string;
  logoUrl: string | null;
  openPositionsNote: string | null;
  descriptionPreview: string | null;
  publishedJobsCount: number;
  isNew?: boolean;
};

export function CompanyBrowseGrid({ companies }: { companies: CompanyBrowseItem[] }) {
  if (companies.length === 0) {
    return (
      <div className="gj-card p-12 text-center text-sm text-[var(--gj-muted)]">
        Noch keine Unternehmen verfügbar.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {companies.map((c) => {
        const initial = c.companyName.slice(0, 2).toUpperCase();
        return (
          <Link
            key={c.id}
            href={`/dashboard/worker/unternehmen/${c.publicSlug}`}
            className="group gj-card gj-card-interactive relative block overflow-hidden p-5 transition hover:shadow-md"
          >
            {c.publishedJobsCount > 0 ? (
              <div className="gj-ribbon pointer-events-none transition-opacity duration-200 group-hover:opacity-0">
                Stellen offen
              </div>
            ) : null}
            <div className="flex items-start gap-4">
              {c.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logoUrl} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-white" />
              ) : (
                <BrandAvatar className="h-12 w-12 text-sm">{initial}</BrandAvatar>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-[var(--gj-text)]">{c.companyName}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--gj-muted)]">
                  <MapPinIcon /> {c.region}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="gj-chip text-[11px]">
                <BriefcaseIcon className="h-3.5 w-3.5" /> {c.industry}
              </span>
              {c.publishedJobsCount > 0 ? (
                <span className="gj-chip gj-chip-solid text-[11px]">
                  {c.publishedJobsCount} Stelle{c.publishedJobsCount === 1 ? "" : "n"}
                </span>
              ) : null}
            </div>
            {c.descriptionPreview ? (
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[var(--gj-text)]/80">
                {c.descriptionPreview}
              </p>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

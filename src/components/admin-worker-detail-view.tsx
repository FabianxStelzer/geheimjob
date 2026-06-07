import Link from "next/link";
import { ApplicationProfileDisplay } from "@/components/application-profile-display";
import { AdminDataSection, AdminFieldGrid } from "@/components/admin-data-section";
import { CvDraftPreview } from "@/components/cv-draft-preview";
import { parseApplicationProfile } from "@/lib/application-profile";
import { workerHasCv } from "@/lib/cv-access";
import { workerProfilePhotoUrls } from "@/lib/worker-profile-photos";

type WorkerUser = {
  id: string;
  email: string;
  createdAt: Date;
  referralCode: string;
  referredByUserId: string | null;
  workerProfile: {
    id: string;
    displayName: string;
    professionField: string;
    employmentKind: string | null;
    experienceYears: number;
    region: string;
    availability: string;
    salaryExpectation: number | null;
    salaryPublic: boolean;
    salaryKind: string;
    bio: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    socialLinkedin: string | null;
    socialXing: string | null;
    socialWebsite: string | null;
    profileVisible: boolean;
    anonymousSlug: string;
    cvShareMode: string;
    cvPdfFilename: string | null;
    cvDraftJson: string | null;
    videoIntroUrl: string | null;
    applicationProfileJson: string | null;
    profilePhotosJson: string | null;
    photoUrl: string | null;
    updatedAt: Date;
  } | null;
  _count: { referrals: number };
};

type MatchRow = {
  id: string;
  status: string;
  hiringStage: string;
  createdAt: Date;
  employerProfile: { companyName: string };
  jobPosting: { title: string } | null;
};

export function AdminWorkerDetailView({
  user,
  matches,
}: {
  user: WorkerUser;
  matches: MatchRow[];
}) {
  const p = user.workerProfile;
  if (!p) {
    return <p className="text-sm text-rose-700">Kein Arbeitnehmer-Profil hinterlegt.</p>;
  }

  const photos = workerProfilePhotoUrls(p.profilePhotosJson, p.photoUrl);
  const application = parseApplicationProfile(p.applicationProfileJson);
  const hasCv = workerHasCv(p);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--gj-text)]">{p.displayName}</h1>
          <p className="mt-1 text-sm text-[var(--gj-muted)]">{user.email}</p>
        </div>
        <Link href="/dashboard/admin/arbeitnehmer" className="gj-btn-ghost text-sm">
          ← Zurück zur Liste
        </Link>
      </div>

      {photos.length > 0 ? (
        <AdminDataSection title="Profilfotos">
          <div className="flex flex-wrap gap-2">
            {photos.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt=""
                className="h-24 w-24 rounded-xl object-cover ring-2 ring-[var(--gj-primary-soft)]"
              />
            ))}
          </div>
        </AdminDataSection>
      ) : null}

      <AdminDataSection title="Konto">
        <AdminFieldGrid
          rows={[
            { label: "User-ID", value: <code className="text-xs">{user.id}</code> },
            { label: "E-Mail (Login)", value: user.email },
            { label: "Registriert", value: user.createdAt.toLocaleString("de-DE") },
            { label: "Referral-Code", value: user.referralCode },
            { label: "Empfehlungen", value: String(user._count.referrals) },
            { label: "Profil-Link", value: `/p/${p.anonymousSlug}` },
            { label: "Zuletzt aktualisiert", value: p.updatedAt.toLocaleString("de-DE") },
          ]}
        />
      </AdminDataSection>

      <AdminDataSection title="Stammdaten">
        <AdminFieldGrid
          rows={[
            { label: "Name", value: p.displayName },
            { label: "Berufsfeld", value: p.professionField },
            { label: "Beschäftigungsart", value: p.employmentKind },
            { label: "Region", value: p.region },
            { label: "Verfügbarkeit", value: p.availability },
            { label: "Erfahrung (Jahre)", value: String(p.experienceYears) },
            {
              label: "Gehaltswunsch",
              value: p.salaryExpectation
                ? `${p.salaryExpectation.toLocaleString("de-DE")} € (${p.salaryKind}, ${p.salaryPublic ? "öffentlich" : "privat"})`
                : "—",
            },
            { label: "In Suche sichtbar", value: p.profileVisible ? "Ja" : "Nein" },
            { label: "Telefon", value: p.contactPhone },
            { label: "Kontakt-E-Mail", value: p.contactEmail },
            { label: "LinkedIn", value: p.socialLinkedin },
            { label: "XING", value: p.socialXing },
            { label: "Website", value: p.socialWebsite },
          ]}
        />
        {p.bio ? (
          <p className="mt-4 whitespace-pre-wrap rounded-lg border border-[var(--gj-border)] bg-white p-4 text-sm">
            {p.bio}
          </p>
        ) : null}
      </AdminDataSection>

      <AdminDataSection title="Bewerbungsprofil">
        <ApplicationProfileDisplay
          profile={{
            bio: p.bio,
            contactPhone: p.contactPhone,
            contactEmail: p.contactEmail,
            socialLinkedin: p.socialLinkedin,
            socialXing: p.socialXing,
            socialWebsite: p.socialWebsite,
            application,
          }}
        />
      </AdminDataSection>

      <AdminDataSection title="Lebenslauf & Dateien">
        <AdminFieldGrid
          rows={[
            { label: "Lebenslauf vorhanden", value: hasCv ? "Ja" : "Nein" },
            { label: "Freigabe-Modus", value: p.cvShareMode },
            { label: "PDF hochgeladen", value: p.cvPdfFilename ? "Ja" : "Nein" },
            { label: "Video", value: p.videoIntroUrl ? "Ja" : "Nein" },
          ]}
        />
        {p.cvDraftJson ? (
          <div className="mt-4">
            <CvDraftPreview
              draftJson={p.cvDraftJson}
              meta={{
                displayName: p.displayName,
                professionField: p.professionField,
                region: p.region,
              }}
            />
          </div>
        ) : null}
        {p.videoIntroUrl ? (
          <video
            className="mt-4 w-full max-w-md rounded-xl border border-[var(--gj-border)]"
            controls
            src={p.videoIntroUrl}
          />
        ) : null}
      </AdminDataSection>

      <AdminDataSection title={`Matches & Anfragen (${matches.length})`}>
        {matches.length === 0 ? (
          <p className="text-sm text-[var(--gj-muted)]">Keine Matches.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--gj-border)] text-xs uppercase text-[var(--gj-muted)]">
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Stufe</th>
                  <th className="py-2 pr-4">Unternehmen</th>
                  <th className="py-2 pr-4">Stelle</th>
                  <th className="py-2">Datum</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} className="border-b border-[var(--gj-border)]">
                    <td className="py-2 pr-4">{m.status}</td>
                    <td className="py-2 pr-4">{m.hiringStage}</td>
                    <td className="py-2 pr-4">{m.employerProfile.companyName}</td>
                    <td className="py-2 pr-4">{m.jobPosting?.title ?? "—"}</td>
                    <td className="py-2 text-[var(--gj-muted)]">
                      {m.createdAt.toLocaleDateString("de-DE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminDataSection>
    </div>
  );
}

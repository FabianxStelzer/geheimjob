import type { ApplicationProfile } from "@/lib/application-profile";
import type { PublicTalentProfile } from "@/lib/anonymous-profile";
import { BriefcaseIcon, MapPinIcon } from "@/components/icons";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--gj-muted)]">
        {title}
      </h4>
      {children}
    </section>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="gj-chip gj-chip-neutral text-[11px]">
          {item}
        </span>
      ))}
    </div>
  );
}

export function ApplicationProfileDisplay({
  profile,
}: {
  profile: Pick<
    PublicTalentProfile,
    | "bio"
    | "contactPhone"
    | "contactEmail"
    | "socialLinkedin"
    | "socialXing"
    | "socialWebsite"
    | "application"
  >;
}) {
  const app = profile.application;
  const hasContact =
    profile.contactPhone ||
    profile.contactEmail ||
    profile.socialLinkedin ||
    profile.socialXing ||
    profile.socialWebsite;

  const hasExperiences = app.experiences.some((e) => e.company.trim() || e.role.trim());
  const hasEducation = app.education.some((e) => e.institution.trim() || e.degree.trim());

  return (
    <div className="space-y-6">
      {app.headline ? (
        <p className="text-sm font-medium text-[var(--gj-primary)]">{app.headline}</p>
      ) : null}

      {profile.bio ? (
        <Section title="Über mich">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--gj-text)]/90">
            {profile.bio}
          </p>
        </Section>
      ) : null}

      {hasContact ? (
        <Section title="Kontakt">
          <dl className="space-y-2 text-sm">
            {profile.contactPhone ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--gj-muted)]">Telefon</dt>
                <dd className="font-medium">{profile.contactPhone}</dd>
              </div>
            ) : null}
            {profile.contactEmail ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--gj-muted)]">E-Mail</dt>
                <dd className="font-medium">{profile.contactEmail}</dd>
              </div>
            ) : null}
            {profile.socialLinkedin ? (
              <div>
                <dt className="text-[var(--gj-muted)]">LinkedIn</dt>
                <dd className="mt-0.5 break-all font-medium text-[var(--gj-primary)]">
                  {profile.socialLinkedin}
                </dd>
              </div>
            ) : null}
            {profile.socialXing ? (
              <div>
                <dt className="text-[var(--gj-muted)]">XING</dt>
                <dd className="mt-0.5 break-all font-medium text-[var(--gj-primary)]">
                  {profile.socialXing}
                </dd>
              </div>
            ) : null}
            {profile.socialWebsite ? (
              <div>
                <dt className="text-[var(--gj-muted)]">Website</dt>
                <dd className="mt-0.5 break-all font-medium text-[var(--gj-primary)]">
                  {profile.socialWebsite}
                </dd>
              </div>
            ) : null}
          </dl>
        </Section>
      ) : null}

      {app.skills.length ? (
        <Section title="Fähigkeiten">
          <ChipList items={app.skills} />
        </Section>
      ) : null}

      {hasExperiences ? (
        <Section title="Werdegang">
          <ul className="space-y-4">
            {app.experiences
              .filter((e) => e.company.trim() || e.role.trim())
              .map((e) => (
                <li
                  key={e.id}
                  className="rounded-xl border border-[var(--gj-border)] bg-white p-4 text-sm"
                >
                  <p className="font-semibold text-[var(--gj-text)]">{e.role || "Position"}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[var(--gj-muted)]">
                    <BriefcaseIcon className="h-3.5 w-3.5" />
                    {e.company}
                    {e.location ? (
                      <>
                        <span>·</span>
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {e.location}
                      </>
                    ) : null}
                  </p>
                  {e.from || e.to ? (
                    <p className="mt-1 text-xs text-[var(--gj-muted)]">
                      {e.from}
                      {e.from && e.to ? " – " : ""}
                      {e.to || "heute"}
                    </p>
                  ) : null}
                  {e.description ? (
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed text-[var(--gj-text)]/85">
                      {e.description}
                    </p>
                  ) : null}
                </li>
              ))}
          </ul>
        </Section>
      ) : null}

      {hasEducation ? (
        <Section title="Ausbildung">
          <ul className="space-y-3">
            {app.education
              .filter((e) => e.institution.trim() || e.degree.trim())
              .map((e) => (
                <li key={e.id} className="text-sm">
                  <p className="font-semibold">{e.degree || "Abschluss"}</p>
                  <p className="text-[var(--gj-muted)]">{e.institution}</p>
                  {e.from || e.to ? (
                    <p className="text-xs text-[var(--gj-muted)]">
                      {e.from}
                      {e.from && e.to ? " – " : ""}
                      {e.to}
                    </p>
                  ) : null}
                </li>
              ))}
          </ul>
        </Section>
      ) : null}

      {app.languages.length ? (
        <Section title="Sprachen">
          <ChipList items={app.languages} />
        </Section>
      ) : null}

      {app.certificates.length ? (
        <Section title="Zertifikate">
          <ChipList items={app.certificates} />
        </Section>
      ) : null}

      {app.interests.length ? (
        <Section title="Interessen">
          <ChipList items={app.interests} />
        </Section>
      ) : null}
    </div>
  );
}

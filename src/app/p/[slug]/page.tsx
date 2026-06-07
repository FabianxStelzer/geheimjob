import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { ApplicationProfileDisplay } from "@/components/application-profile-display";
import { parseApplicationProfile } from "@/lib/application-profile";
import { applyVisibilityToEmployerView } from "@/lib/apply-profile-visibility";
import { prisma } from "@/lib/prisma";
import { workerProfilePhotoUrls } from "@/lib/worker-profile-photos";

type Props = { params: Promise<{ slug: string }> };

export default async function PublicTalentProfilePage(props: Props) {
  const { slug } = await props.params;

  const profile = await prisma.workerProfile.findUnique({
    where: { anonymousSlug: slug },
    include: { user: true },
  });

  if (!profile || profile.user.deletedAt || !profile.profileVisible) {
    notFound();
  }

  const photoUrls = workerProfilePhotoUrls(profile.profilePhotosJson, profile.photoUrl);
  const application = parseApplicationProfile(profile.applicationProfileJson);
  const visible = applyVisibilityToEmployerView({
    profile,
    application,
    photoUrls,
    matchAccepted: false,
  });

  return (
    <div className="min-h-screen bg-[var(--gj-bg)]">
      <header className="border-b border-[var(--gj-border)] bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <BrandLogo className="text-base min-w-[120px]" />
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--gj-primary)] hover:text-[var(--gj-primary-hover)]"
          >
            Anmelden
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl flex-1 px-4 py-12 sm:py-16">
        <div className="gj-card space-y-6 p-8 sm:p-10">
          {visible.photoUrls.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2">
              {visible.photoUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="h-28 w-28 rounded-2xl object-cover ring-2 ring-[var(--gj-primary-soft)]"
                />
              ))}
            </div>
          ) : null}

          <div>
            <h1 className="text-[28px] font-bold leading-tight text-[var(--gj-text)]">
              {profile.displayName}
            </h1>
            <p className="mt-2 text-sm text-[var(--gj-text-secondary)]">
              {profile.professionField}
              {visible.application.headline ? ` · ${visible.application.headline}` : ""}
            </p>
            <p className="mt-2 text-sm text-[var(--gj-text-secondary)]">
              {profile.region} · {profile.experienceYears} Jahre Erfahrung · Verfügbarkeit:{" "}
              {profile.availability}
            </p>
            {visible.salaryExpectation != null ? (
              <p className="mt-2 text-sm text-[var(--gj-text-secondary)]">
                Gehaltsvorstellung: {visible.salaryExpectation.toLocaleString("de-DE")} € / Monat
              </p>
            ) : null}
          </div>

          {visible.videoIntroUrl ? (
            <video
              className="w-full rounded-xl border border-[var(--gj-border)]"
              controls
              src={visible.videoIntroUrl}
            />
          ) : null}

          <ApplicationProfileDisplay
            profile={{
              bio: visible.bio,
              contactPhone: visible.contactPhone,
              contactEmail: visible.contactEmail,
              socialLinkedin: visible.socialLinkedin,
              socialXing: visible.socialXing,
              socialWebsite: visible.socialWebsite,
              application: visible.application,
            }}
          />

          <p className="border-t border-[var(--gj-border)] pt-6 text-xs text-[var(--gj-muted)]">
            Lebenslauf und Video sind nur für registrierte Arbeitgeber sichtbar — und nur nach Ihrer
            Freigabe bzw. bei Einstellung „Sofort teilen“.
          </p>
        </div>
      </main>
    </div>
  );
}

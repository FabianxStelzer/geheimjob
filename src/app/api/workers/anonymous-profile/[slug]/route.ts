import { auth } from "@/auth";
import { getEmployerEntitlements } from "@/lib/employer-billing";
import type { PublicTalentProfile } from "@/lib/anonymous-profile";
import { parseApplicationProfile } from "@/lib/application-profile";
import { employerIsBlockedFromWorker } from "@/lib/platform";
import { workerProfilePhotoUrls } from "@/lib/worker-profile-photos";
import { cvAccessUiState, workerHasCv } from "@/lib/cv-access";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, props: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return Response.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const ent = await getEmployerEntitlements(session.user.id);
  if (!ent.talentPool) {
    return Response.json({ error: "Aktives Paket erforderlich." }, { status: 402 });
  }

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!employer) {
    return Response.json({ error: "Kein Unternehmensprofil." }, { status: 400 });
  }

  const { slug } = await props.params;
  const profile = await prisma.workerProfile.findUnique({
    where: { anonymousSlug: slug },
    include: { user: true },
  });

  if (!profile || profile.user.deletedAt || !profile.profileVisible) {
    return Response.json({ error: "Profil nicht gefunden." }, { status: 404 });
  }

  const blocked = await employerIsBlockedFromWorker({
    workerProfileId: profile.id,
    employerUserId: session.user.id,
    companyName: employer.companyName,
    website: employer.website,
    managingDirectorName: employer.managingDirectorName,
    contactName: employer.contactName,
  });
  if (blocked) {
    return Response.json({ error: "Profil nicht verfügbar." }, { status: 403 });
  }

  const hasCv = workerHasCv(profile);

  const existingMatch = await prisma.matchRequest.findFirst({
    where: {
      workerProfileId: profile.id,
      employerProfileId: employer.id,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
    orderBy: { updatedAt: "desc" },
  });

  const employerMatch = existingMatch
    ? {
        id: existingMatch.id,
        status: existingMatch.status as "PENDING" | "ACCEPTED",
        cvAccess: cvAccessUiState(existingMatch, profile),
      }
    : null;

  const canViewCv =
    hasCv &&
    (profile.cvShareMode === "IMMEDIATE" || Boolean(employerMatch?.cvAccess.canView));

  let showCvDraft: string | null = null;
  if (canViewCv && profile.cvDraftJson) {
    showCvDraft = profile.cvDraftJson;
  }

  const out: PublicTalentProfile = {
    displayName: profile.displayName,
    professionField: profile.professionField,
    region: profile.region,
    experienceYears: profile.experienceYears,
    availability: profile.availability,
    employmentKind: profile.employmentKind,
    salaryExpectation:
      profile.salaryPublic && profile.salaryExpectation != null
        ? profile.salaryExpectation
        : null,
    salaryPublic: profile.salaryPublic,
    bio: profile.bio,
    contactPhone: profile.contactPhone,
    contactEmail: profile.contactEmail,
    socialLinkedin: profile.socialLinkedin,
    socialXing: profile.socialXing,
    socialWebsite: profile.socialWebsite,
    photoUrls: workerProfilePhotoUrls(profile.profilePhotosJson, profile.photoUrl),
    application: parseApplicationProfile(profile.applicationProfileJson),
    cvShareMode: profile.cvShareMode,
    hasCv,
    cvDraftJson: showCvDraft,
    cvPdfAvailable: Boolean(profile.cvPdfFilename) && canViewCv,
    employerMatch,
  };

  return Response.json({ profile: out });
}

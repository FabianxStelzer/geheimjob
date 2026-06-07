import { emptyApplicationProfile, type ApplicationProfile } from "@/lib/application-profile";
import {
  employerMayViewSection,
  parseProfileVisibility,
  type WorkerProfileVisibilitySettings,
} from "@/lib/worker-profile-visibility";
import type { WorkerProfile } from "@prisma/client";

type ProfileSlice = Pick<
  WorkerProfile,
  | "profileVisibilityJson"
  | "profileVisible"
  | "salaryPublic"
  | "cvShareMode"
  | "bio"
  | "contactPhone"
  | "contactEmail"
  | "socialLinkedin"
  | "socialXing"
  | "socialWebsite"
  | "videoIntroUrl"
  | "profilePhotosJson"
  | "photoUrl"
  | "applicationProfileJson"
  | "salaryExpectation"
>;

export function getVisibilitySettings(profile: ProfileSlice): WorkerProfileVisibilitySettings {
  return parseProfileVisibility(profile.profileVisibilityJson, profile);
}

export function applyVisibilityToEmployerView(opts: {
  profile: ProfileSlice;
  application: ApplicationProfile;
  photoUrls: string[];
  matchAccepted: boolean;
}) {
  const vis = getVisibilitySettings(opts.profile);
  const show = (mode: typeof vis.photos) => employerMayViewSection(mode, opts.matchAccepted);

  const canShowVideo =
    Boolean(opts.profile.videoIntroUrl) &&
    (vis.video === "PUBLIC" ||
      (vis.video === "ON_REQUEST" && opts.matchAccepted));

  return {
    visibility: vis,
    photoUrls: show(vis.photos) ? opts.photoUrls : [],
    bio: show(vis.bio) ? opts.profile.bio : null,
    contactPhone: show(vis.contact) ? opts.profile.contactPhone : null,
    contactEmail: show(vis.contact) ? opts.profile.contactEmail : null,
    socialLinkedin: show(vis.contact) ? opts.profile.socialLinkedin : null,
    socialXing: show(vis.contact) ? opts.profile.socialXing : null,
    socialWebsite: show(vis.contact) ? opts.profile.socialWebsite : null,
    application: show(vis.application) ? opts.application : emptyApplicationProfile(),
    salaryExpectation:
      vis.salary === "PUBLIC" && opts.profile.salaryExpectation != null
        ? opts.profile.salaryExpectation
        : null,
    salaryPublic: vis.salary === "PUBLIC",
    videoIntroUrl: canShowVideo ? opts.profile.videoIntroUrl : null,
  };
}

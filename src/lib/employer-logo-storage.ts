import path from "path";

export type EmployerLogoVariant = "banner" | "square";

export function employerLogoPublicUrl(userId: string, filename: string) {
  return `/api/media/employer/${userId}/${filename}`;
}

export function employerLogoDiskPath(userId: string, filename: string) {
  return path.join(process.cwd(), "public", "uploads", "employer", userId, filename);
}

export function employerLogoField(variant: EmployerLogoVariant): "logoUrl" | "logoSquareUrl" {
  return variant === "banner" ? "logoUrl" : "logoSquareUrl";
}

/** Avatar in Stellenanzeigen & Listen — quadratisch bevorzugt. */
export function employerAvatarLogo(
  logoSquareUrl: string | null | undefined,
  logoUrl: string | null | undefined,
): string | null {
  return logoSquareUrl ?? logoUrl ?? null;
}

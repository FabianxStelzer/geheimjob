import path from "path";

/** Öffentliche URL — über API-Media-Route (zuverlässig hinter Reverse-Proxy). */
export function profilePhotoPublicUrl(userId: string, filename: string) {
  return `/api/media/profile/${userId}/${filename}`;
}

export function profilePhotoDiskPath(userId: string, filename: string) {
  return path.join(process.cwd(), "public", "uploads", "profile", userId, filename);
}

export function resolveLegacyPhotoUrl(url: string): string {
  if (url.startsWith("/uploads/profile/")) {
    const parts = url.split("/").filter(Boolean);
    const userId = parts[2];
    const filename = parts[3];
    if (userId && filename) return profilePhotoPublicUrl(userId, filename);
  }
  return url;
}

export type WorkerProfilePhoto = {
  id: string;
  url: string;
};

const MAX_PHOTOS = 8;

export function parseWorkerProfilePhotos(
  profilePhotosJson: string | null | undefined,
  legacyPhotoUrl: string | null | undefined,
): WorkerProfilePhoto[] {
  if (profilePhotosJson) {
    try {
      const raw = JSON.parse(profilePhotosJson) as unknown;
      if (Array.isArray(raw)) {
        const out: WorkerProfilePhoto[] = [];
        for (const item of raw) {
          if (typeof item === "string" && item.trim()) {
            out.push({ id: item, url: item });
          } else if (item && typeof item === "object") {
            const o = item as { id?: string; url?: string };
            const url = String(o.url || "").trim();
            if (!url) continue;
            out.push({ id: String(o.id || url), url });
          }
        }
        if (out.length) return out.slice(0, MAX_PHOTOS);
      }
    } catch {
      /* fall through */
    }
  }
  if (legacyPhotoUrl?.trim()) {
    return [{ id: legacyPhotoUrl, url: legacyPhotoUrl }];
  }
  return [];
}

export function serializeWorkerProfilePhotos(photos: WorkerProfilePhoto[]): string {
  return JSON.stringify(photos.slice(0, MAX_PHOTOS));
}

export function primaryWorkerPhotoUrl(
  profilePhotosJson: string | null | undefined,
  legacyPhotoUrl: string | null | undefined,
): string | null {
  const photos = parseWorkerProfilePhotos(profilePhotosJson, legacyPhotoUrl);
  return photos[0]?.url ?? null;
}

export function workerPhotosToDb(
  photos: WorkerProfilePhoto[],
): { profilePhotosJson: string; photoUrl: string | null } {
  const trimmed = photos.slice(0, MAX_PHOTOS);
  return {
    profilePhotosJson: serializeWorkerProfilePhotos(trimmed),
    photoUrl: trimmed[0]?.url ?? null,
  };
}

export { MAX_PHOTOS };

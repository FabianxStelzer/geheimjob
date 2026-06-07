"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseApplicationProfile, serializeApplicationProfile } from "@/lib/application-profile";

export async function saveApplicationProfile(
  json: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return { ok: false, error: "Nicht angemeldet." };
  }

  const profile = parseApplicationProfile(json);
  const row = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!row) return { ok: false, error: "Kein Profil gefunden." };

  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: { applicationProfileJson: serializeApplicationProfile(profile) },
  });

  revalidatePath("/dashboard/worker/profil");
  revalidatePath("/dashboard/employer/suche");
  return { ok: true };
}

import { auth } from "@/auth";
import { WorkerProfileOnboarding } from "@/components/worker-profile-onboarding";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function WorkerEinrichtungPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    redirect("/login");
  }

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return <p className="text-sm text-red-600">Kein Profil gefunden.</p>;
  }

  return <WorkerProfileOnboarding profile={profile} />;
}

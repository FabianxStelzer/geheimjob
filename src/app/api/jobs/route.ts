import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listPublishedJobsForWorkerProfile } from "@/lib/job-postings-for-worker";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return Response.json({ error: "Nur für Arbeitnehmer." }, { status: 403 });
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!worker) return Response.json({ error: "Kein Profil." }, { status: 404 });

  const jobs = await listPublishedJobsForWorkerProfile(worker.id);
  return Response.json({ jobs });
}

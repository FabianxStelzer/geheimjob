import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listPublishedJobsForWorkerProfile } from "@/lib/job-postings-for-worker";
import WorkerJobExplorer from "./worker-job-explorer";

export default async function WorkerHome() {
  const session = await auth();
  if (!session?.user) return null;

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!worker) return <p className="text-sm text-red-600">Kein Profil gefunden.</p>;

  const jobs = await listPublishedJobsForWorkerProfile(worker.id);
  const netCalcSettings =
    worker.taxClass && worker.taxClass >= 1 && worker.taxClass <= 6
      ? {
          taxClass: worker.taxClass,
          churchTax: worker.churchTax,
          federalState: worker.federalState,
        }
      : null;

  return <WorkerJobExplorer initialJobs={jobs} netCalcSettings={netCalcSettings} />;
}

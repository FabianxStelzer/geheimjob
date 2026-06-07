import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminWorkerDetailView } from "@/components/admin-worker-detail-view";
import { redirect } from "next/navigation";

export default async function AdminWorkerDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const { userId } = await params;
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "WORKER", deletedAt: null },
    include: {
      workerProfile: true,
      _count: { select: { referrals: true } },
    },
  });

  if (!user) notFound();

  const matches = user.workerProfile
    ? await prisma.matchRequest.findMany({
        where: { workerProfileId: user.workerProfile.id },
        orderBy: { createdAt: "desc" },
        include: {
          employerProfile: { select: { companyName: true } },
          jobPosting: { select: { title: true } },
        },
      })
    : [];

  return <AdminWorkerDetailView user={user} matches={matches} />;
}

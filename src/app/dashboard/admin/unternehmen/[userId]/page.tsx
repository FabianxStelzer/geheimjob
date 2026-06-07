import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminEmployerDetailView } from "@/components/admin-employer-detail-view";
import { redirect } from "next/navigation";

export default async function AdminEmployerDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const { userId } = await params;
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "EMPLOYER", deletedAt: null },
    include: {
      employerProfile: true,
      subscription: true,
    },
  });

  if (!user) notFound();

  const jobs = user.employerProfile
    ? await prisma.jobPosting.findMany({
        where: { employerProfileId: user.employerProfile.id },
        orderBy: { updatedAt: "desc" },
        include: { _count: { select: { matches: true } } },
      })
    : [];

  const matches = user.employerProfile
    ? await prisma.matchRequest.findMany({
        where: { employerProfileId: user.employerProfile.id },
        orderBy: { createdAt: "desc" },
        include: {
          workerProfile: { select: { displayName: true, professionField: true } },
          jobPosting: { select: { title: true } },
        },
      })
    : [];

  return <AdminEmployerDetailView user={user} jobs={jobs} matches={matches} />;
}

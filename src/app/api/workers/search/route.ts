import { auth } from "@/auth";
import { getEmployerEntitlements } from "@/lib/employer-billing";
import { prisma } from "@/lib/prisma";
import {
  employerIsBlockedFromWorker,
  parseSalaryRange,
} from "@/lib/platform";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return Response.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!employer) {
    return Response.json({ error: "Kein Unternehmensprofil." }, { status: 400 });
  }

  const ent = await getEmployerEntitlements(session.user.id);
  if (!ent.talentPool) {
    return Response.json(
      { error: "Aktives Paket erforderlich. Bitte unter Abrechnung buchen." },
      { status: 402 },
    );
  }

  const { searchParams } = new URL(req.url);
  const professionField = searchParams.get("professionField") || undefined;
  const region = searchParams.get("region") || undefined;
  const availability = searchParams.get("availability") || undefined;
  const salaryRange = parseSalaryRange(searchParams.get("salary"));

  const workers = await prisma.workerProfile.findMany({
    where: {
      profileVisible: true,
      user: { deletedAt: null },
      ...(professionField
        ? { professionField: { contains: professionField } }
        : {}),
      ...(region ? { region: { contains: region } } : {}),
      ...(availability ? { availability: { contains: availability } } : {}),
      ...(salaryRange ? { salaryExpectation: salaryRange } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 80,
  });

  const out = [];
  for (const w of workers) {
    const blocked = await employerIsBlockedFromWorker({
      workerProfileId: w.id,
      employerUserId: session.user.id,
      companyName: employer.companyName,
    });
    if (blocked) continue;
    out.push({
      id: w.id,
      professionField: w.professionField,
      experienceYears: w.experienceYears,
      region: w.region,
      availability: w.availability,
      salaryExpectation: w.salaryPublic ? w.salaryExpectation : null,
      anonymousSlug: w.anonymousSlug,
      bioPreview: w.bio ? w.bio.slice(0, 160) : null,
      photoUrl: w.photoUrl,
    });
  }

  return Response.json({ workers: out });
}

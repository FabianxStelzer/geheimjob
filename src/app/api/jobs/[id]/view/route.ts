import { auth } from "@/auth";
import { recordJobPostingDetailView } from "@/lib/job-posting-stats";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, props: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return Response.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const { id } = await props.params;
  const result = await recordJobPostingDetailView(id, session.user.id);
  if (!result.ok) {
    return Response.json({ error: "Stelle nicht gefunden." }, { status: 404 });
  }

  return Response.json({ ok: true });
}

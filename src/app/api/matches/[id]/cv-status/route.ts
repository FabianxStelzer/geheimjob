import { auth } from "@/auth";
import { getMatchCvStatusForUser } from "@/lib/match-cv-status";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, props: Params) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  if (session.user.role !== "EMPLOYER" && session.user.role !== "WORKER") {
    return Response.json({ error: "Nicht berechtigt." }, { status: 403 });
  }

  const { id } = await props.params;
  const data = await getMatchCvStatusForUser(id, session.user.id, session.user.role);
  if (!data) {
    return Response.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  return Response.json(data);
}

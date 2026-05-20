import { auth } from "@/auth";
import { softDeleteUser } from "@/lib/platform";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  await softDeleteUser(session.user.id);
  return Response.json({ ok: true });
}

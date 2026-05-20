import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Keine Marketing-Startseite: eingeloggt → Dashboard, sonst Login. */
export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  redirect("/login");
}

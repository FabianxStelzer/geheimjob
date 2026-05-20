import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardIndex() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "WORKER") redirect("/dashboard/worker");
  if (session.user.role === "EMPLOYER") redirect("/dashboard/employer");
  if (session.user.role === "ADMIN") redirect("/dashboard/admin");

  redirect("/login");
}

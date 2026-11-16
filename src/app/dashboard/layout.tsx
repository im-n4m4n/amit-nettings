import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Fdashboard");

  return (
    <DashboardShell user={{ name: session.name, email: session.email }}>{children}</DashboardShell>
  );
}

import type { Metadata } from "next"

import { DashboardShell } from "@/components/dashboard/DashboardShell"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <DashboardShell>{children}</DashboardShell>
}

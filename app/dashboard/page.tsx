"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { PageLoader } from "@/components/shared/Loader"
import { useAuthStore } from "@/lib/auth-store"

const ROLE_DASHBOARD: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  VENDOR: "/dashboard/vendor",
  CUSTOMER: "/dashboard/customer",
}

export default function DashboardIndexPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) return
    router.replace(ROLE_DASHBOARD[user.role] ?? "/dashboard/customer")
  }, [user, router])

  return <PageLoader label="Taking you to your dashboard..." />
}

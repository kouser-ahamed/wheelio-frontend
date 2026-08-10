"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PageLoader } from "@/components/shared/Loader"

export default function AdminDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/admin/overview")
  }, [router])

  return <PageLoader label="Loading admin dashboard..." />
}

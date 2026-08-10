"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PageLoader } from "@/components/shared/Loader"

export default function CustomerDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/customer/overview")
  }, [router])

  return <PageLoader label="Loading customer dashboard..." />
}

"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PageLoader } from "@/components/shared/Loader"

export default function VendorDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/vendor/overview")
  }, [router])

  return <PageLoader label="Loading vendor dashboard..." />
}

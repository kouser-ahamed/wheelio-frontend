import type { Metadata } from "next"
import { Suspense } from "react"

import { PageLoader } from "@/components/shared/Loader"
import { VehiclesClient } from "@/components/vehicles/VehiclesClient"

export const metadata: Metadata = {
  title: "Browse Vehicles",
  description:
    "Browse the Wheelio fleet. Filter by category, price, and availability.",
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading vehicles..." />}>
      <VehiclesClient />
    </Suspense>
  )
}

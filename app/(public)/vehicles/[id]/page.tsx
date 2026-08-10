import type { Metadata } from "next"

import { VehicleDetailClient } from "@/components/vehicles/VehicleDetailClient"

export const metadata: Metadata = {
  title: "Vehicle Details",
}

interface VehicleDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function VehicleDetailPage({
  params,
}: VehicleDetailPageProps) {
  const { id } = await params
  return <VehicleDetailClient vehicleId={id} />
}

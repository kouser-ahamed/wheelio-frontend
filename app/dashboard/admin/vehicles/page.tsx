"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import { PageLoader } from "@/components/shared/Loader"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getErrorMessage } from "@/lib/axios"
import { formatCurrency } from "@/lib/format"
import type { ApiResponse, Vehicle } from "@/types"

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { default: axios } = await import("@/lib/axios")
        const res = await axios.get<ApiResponse<Vehicle[]>>("/vehicles", {
          params: { limit: 100 },
        })
        if (active) setVehicles(res.data.data ?? [])
      } catch (err) {
        if (active) setError(getErrorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (loading) return <PageLoader label="Loading vehicles..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicles"
        description="All vehicles on the platform."
      />

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {vehicles.length === 0 ? (
        <EmptyState title="No vehicles found" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price / day</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      {vehicle.images?.[0] ? (
                        <Image
                          src={vehicle.images[0]}
                          alt={vehicle.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <Link
                        href={`/vehicles/${vehicle.id}`}
                        className="font-medium hover:underline"
                      >
                        {vehicle.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {vehicle.brand} · {vehicle.model}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{vehicle.category?.name ?? "—"}</TableCell>
                <TableCell>{vehicle.vendor?.name ?? vehicle.vendorId}</TableCell>
                <TableCell>
                  <StatusBadge status={vehicle.status} />
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(vehicle.pricePerDay)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

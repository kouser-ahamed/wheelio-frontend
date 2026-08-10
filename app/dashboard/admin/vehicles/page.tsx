"use client"

import Image from "next/image"
import { Car, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { TableSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
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

  const load = async () => {
    try {
      const { default: axios } = await import("@/lib/axios")
      const res = await axios.get<ApiResponse<Vehicle[]>>("/vehicles", {
        params: { limit: 100 },
      })
      setVehicles(res.data.data ?? [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const deleteVehicle = async (vehicle: Vehicle) => {
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.delete(`/vehicles/${vehicle.id}`)
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id))
      toast.success("Vehicle deleted successfully")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="All Vehicles" description="Overview of all vehicles across all vendors." />
        <TableSkeleton rows={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Vehicles"
        description="Overview of all vehicles across all vendors."
      />

      {vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles found"
          description="There are currently no vehicles listed in the platform."
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Price / Day</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 overflow-hidden rounded-md border bg-muted">
                          {vehicle.images?.[0] ? (
                            <Image src={vehicle.images[0]} alt="" fill sizes="48px" className="object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{vehicle.name}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.brand} · {vehicle.model}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.category?.name ?? "—"}</TableCell>
                    <TableCell className="font-medium text-foreground">
                      {vehicle.vendor?.name ?? "—"}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(vehicle.pricePerDay)}</TableCell>
                    <TableCell>
                      <StatusBadge status={vehicle.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteVehicle(vehicle)}
                      >
                        <Trash2 className="size-3.5 mr-1" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid gap-6 sm:grid-cols-2 md:hidden">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative aspect-[16/10] w-full bg-muted">
                    {vehicle.images?.[0] ? (
                      <Image
                        src={vehicle.images[0]}
                        alt={vehicle.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : null}
                    <StatusBadge
                      status={vehicle.status}
                      className="absolute right-3 top-3"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-1">
                  <h3 className="font-semibold text-base">{vehicle.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Vendor: <span className="font-medium text-foreground">{vehicle.vendor?.name ?? "—"}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Category: {vehicle.category?.name ?? "—"}
                  </p>
                  <p className="mt-2 font-bold text-primary">
                    {formatCurrency(vehicle.pricePerDay)}
                    <span className="text-xs font-normal text-muted-foreground">
                      /day
                    </span>
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => deleteVehicle(vehicle)}
                  >
                    <Trash2 className="size-4 mr-1" />
                    Delete Vehicle
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

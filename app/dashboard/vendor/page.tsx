"use client"

import Link from "next/link"
import { CalendarDays, Car, CircleDollarSign, Timer } from "lucide-react"
import { useEffect, useState } from "react"

import { PageLoader } from "@/components/shared/Loader"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { StatCard, StatCardGrid } from "@/components/dashboard/StatCard"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getErrorMessage } from "@/lib/axios"
import { formatCurrency, formatDate } from "@/lib/format"
import type { ApiResponse, Booking, DashboardStats, Vehicle } from "@/types"

export default function VendorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { default: axios } = await import("@/lib/axios")
        const [statsRes, vehiclesRes, bookingsRes] = await Promise.all([
          axios.get<ApiResponse<{ stats: DashboardStats }>>(
            "/dashboard/vendor-stats"
          ),
          axios.get<ApiResponse<Vehicle[]>>("/vehicles/my-vehicles", {
            params: { limit: 5 },
          }),
          axios.get<ApiResponse<Booking[]>>("/bookings/vendor-bookings", {
            params: { limit: 5 },
          }),
        ])
        if (!active) return
        setStats(statsRes.data.data.stats)
        setVehicles(vehiclesRes.data.data ?? [])
        setBookings(bookingsRes.data.data ?? [])
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

  if (loading) return <PageLoader label="Loading vendor overview..." />

  return (
    <div className="space-y-8">
      <PageHeader
        title="Vendor overview"
        description="Your vehicles, bookings, and earnings."
        action={
          <Button render={<Link href="/dashboard/vendor/vehicles" />}>
            <Car />
            Manage vehicles
          </Button>
        }
      />

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <StatCardGrid>
        <StatCard
          icon={Car}
          label="My vehicles"
          value={stats?.totalVehicles ?? 0}
        />
        <StatCard
          icon={CalendarDays}
          label="Total bookings"
          value={stats?.totalBookings ?? 0}
          hint={`${stats?.pendingBookings ?? 0} pending`}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Total earnings"
          value={formatCurrency(stats?.totalEarnings ?? 0)}
        />
        <StatCard
          icon={Timer}
          label="Pending requests"
          value={stats?.pendingBookings ?? 0}
        />
      </StatCardGrid>

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My vehicles</h2>
            <Button variant="link" size="sm" render={<Link href="/dashboard/vendor/vehicles" />}>
              View all
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price / day</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    You haven&apos;t listed any vehicles yet.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={vehicle.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(vehicle.pricePerDay)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Latest bookings</h2>
            <Button variant="link" size="sm" render={<Link href="/dashboard/vendor/bookings" />}>
              View all
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No bookings yet.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.user?.name ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  )
}

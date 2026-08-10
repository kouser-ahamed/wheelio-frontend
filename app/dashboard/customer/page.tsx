"use client"

import Link from "next/link"
import { CalendarDays, ClipboardList, Heart, Wallet } from "lucide-react"
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
import type { ApiResponse, Booking, DashboardStats, Wishlist } from "@/types"

export default function CustomerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [wishlist, setWishlist] = useState<Wishlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { default: axios } = await import("@/lib/axios")
        const [statsRes, bookingsRes, wishlistRes] = await Promise.all([
          axios.get<ApiResponse<{ stats: DashboardStats }>>(
            "/dashboard/customer-stats"
          ),
          axios.get<ApiResponse<Booking[]>>("/bookings/my-bookings", {
            params: { limit: 5 },
          }),
          axios.get<ApiResponse<Wishlist[]>>("/wishlist/my-wishlist", {
            params: { limit: 5 },
          }),
        ])
        if (!active) return
        setStats(statsRes.data.data.stats)
        setBookings(bookingsRes.data.data ?? [])
        setWishlist(wishlistRes.data.data ?? [])
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

  if (loading) return <PageLoader label="Loading your dashboard..." />

  return (
    <div className="space-y-8">
      <PageHeader
        title="My dashboard"
        description="Your bookings, wishlist, and spending."
      />

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <StatCardGrid>
        <StatCard
          icon={CalendarDays}
          label="Total bookings"
          value={stats?.totalBookings ?? 0}
        />
        <StatCard
          icon={ClipboardList}
          label="Active bookings"
          value={stats?.activeBookings ?? 0}
        />
        <StatCard
          icon={Wallet}
          label="Total spent"
          value={formatCurrency(stats?.totalSpent ?? 0)}
        />
        <StatCard
          icon={Heart}
          label="Wishlist items"
          value={stats?.wishlistCount ?? 0}
        />
      </StatCardGrid>

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My bookings</h2>
            <Button variant="link" size="sm" render={<Link href="/dashboard/customer/bookings" />}>
              View all
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    You don&apos;t have any bookings yet.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.vehicle?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(booking.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Wishlist</h2>
            <Button variant="link" size="sm" render={<Link href="/dashboard/customer/wishlist" />}>
              View all
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price / day</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wishlist.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nothing in your wishlist yet.
                  </TableCell>
                </TableRow>
              ) : (
                wishlist.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/vehicles/${item.vehicleId}`}
                        className="hover:underline"
                      >
                        {item.vehicle?.name ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell>{item.vehicle?.category?.name ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {item.vehicle
                        ? formatCurrency(item.vehicle.pricePerDay)
                        : "—"}
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

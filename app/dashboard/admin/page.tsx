"use client"

import { CalendarDays, Car, CircleDollarSign, Users } from "lucide-react"
import { useEffect, useState } from "react"

import { PageLoader } from "@/components/shared/Loader"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { StatCard, StatCardGrid } from "@/components/dashboard/StatCard"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getErrorMessage } from "@/lib/axios"
import { formatCurrency, formatDate } from "@/lib/format"
import type { ApiResponse, Booking, DashboardStats, User } from "@/types"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { default: axios } = await import("@/lib/axios")
        const [statsRes, bookingsRes, usersRes] = await Promise.all([
          axios.get<ApiResponse<{ stats: DashboardStats }>>(
            "/dashboard/admin-stats"
          ),
          axios.get<ApiResponse<Booking[]>>("/bookings", { params: { limit: 5 } }),
          axios.get<ApiResponse<User[]>>("/users", { params: { limit: 5 } }),
        ])
        if (!active) return
        setStats(statsRes.data.data.stats)
        setBookings(bookingsRes.data.data ?? [])
        setUsers(usersRes.data.data ?? [])
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

  if (loading) return <PageLoader label="Loading admin overview..." />

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin overview"
        description="Platform-wide statistics at a glance."
      />

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <StatCardGrid>
        <StatCard
          icon={Users}
          label="Total users"
          value={stats?.totalUsers ?? 0}
          hint={`${stats?.totalVendors ?? 0} vendors · ${stats?.totalCustomers ?? 0} customers`}
        />
        <StatCard
          icon={Car}
          label="Total vehicles"
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
          label="Total revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
        />
      </StatCardGrid>

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent bookings</h2>
            <Button variant="link" size="sm" render={<Link href="/dashboard/admin/bookings" />}>
              View all
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No bookings yet.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.user?.name ?? "—"}</TableCell>
                    <TableCell>{booking.vehicle?.name ?? "—"}</TableCell>
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
            <h2 className="text-lg font-semibold">Latest users</h2>
            <Button variant="link" size="sm" render={<Link href="/dashboard/admin/users" />}>
              View all
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No users yet.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <StatusBadge status={user.role} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDate(user.createdAt)}
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

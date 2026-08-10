"use client"

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
import { formatCurrency, formatDate } from "@/lib/format"
import type { ApiResponse, Booking } from "@/types"

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { default: axios } = await import("@/lib/axios")
        const res = await axios.get<ApiResponse<Booking[]>>("/bookings", {
          params: { limit: 100 },
        })
        if (active) setBookings(res.data.data ?? [])
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

  if (loading) return <PageLoader label="Loading bookings..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="Every booking on the platform."
      />

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {bookings.length === 0 ? (
        <EmptyState title="No bookings found" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.user?.name ?? "—"}</TableCell>
                <TableCell>{booking.vehicle?.name ?? "—"}</TableCell>
                <TableCell className="text-xs">
                  {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={booking.status} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={booking.paymentStatus} />
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(booking.totalPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

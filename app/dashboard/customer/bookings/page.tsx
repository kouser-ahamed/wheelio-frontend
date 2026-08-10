"use client"

import { Link2, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { PageLoader } from "@/components/shared/Loader"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
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
import type { ApiResponse, Booking } from "@/types"

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { default: axios } = await import("@/lib/axios")
      const res = await axios.get<ApiResponse<Booking[]>>("/bookings/my-bookings", {
        params: { limit: 100 },
      })
      setBookings(res.data.data ?? [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const cancelBooking = async (booking: Booking) => {
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.patch(`/bookings/${booking.id}/cancel`)
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: "CANCELLED" } : b
        )
      )
      toast.success("Booking cancelled")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const payBooking = async (booking: Booking) => {
    try {
      const { default: axios } = await import("@/lib/axios")
      const res = await axios.post<ApiResponse<{ url: string }>>(
        "/payments/create-checkout-session",
        { bookingId: booking.id }
      )
      if (res.data.data.url) {
        window.location.replace(res.data.data.url)
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return <PageLoader label="Loading your bookings..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="My bookings"
        description="Review, pay for, or cancel your bookings."
      />

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="Book a vehicle from the fleet to get started."
          action={
            <Button render={<Link href="/vehicles" />}>
              <Link2 />
              Browse vehicles
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
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
                <TableCell>
                  <StatusBadge status={booking.paymentStatus} />
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(booking.totalPrice)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {booking.paymentStatus === "UNPAID" &&
                    booking.status !== "CANCELLED" &&
                    booking.status !== "REJECTED" ? (
                      <Button size="sm" onClick={() => payBooking(booking)}>
                        Pay now
                      </Button>
                    ) : null}
                    {(booking.status === "PENDING" ||
                      booking.status === "CONFIRMED") && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelBooking(booking)}
                      >
                        <X />
                        Cancel
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

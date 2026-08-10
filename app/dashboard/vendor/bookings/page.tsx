"use client"

import { Check, X } from "lucide-react"
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

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { default: axios } = await import("@/lib/axios")
      const res = await axios.get<ApiResponse<Booking[]>>(
        "/bookings/vendor-bookings",
        { params: { limit: 100 } }
      )
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

  const updateStatus = async (booking: Booking, status: "CONFIRMED" | "REJECTED") => {
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.patch(`/bookings/${booking.id}/status`, { status })
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status } : b))
      )
      toast.success(`Booking ${status.toLowerCase()}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return <PageLoader label="Loading bookings..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking requests"
        description="Confirm or reject bookings for your vehicles."
      />

      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" description="Requests for your vehicles will appear here." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <p className="font-medium">{booking.user?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{booking.user?.email}</p>
                </TableCell>
                <TableCell>{booking.vehicle?.name ?? "—"}</TableCell>
                <TableCell className="text-xs">
                  {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(booking.totalPrice)}
                </TableCell>
                <TableCell className="text-right">
                  {booking.status === "PENDING" ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(booking, "CONFIRMED")}
                      >
                        <Check />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(booking, "REJECTED")}
                      >
                        <X />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

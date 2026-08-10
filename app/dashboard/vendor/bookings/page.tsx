"use client"

import { Calendar, Check, X } from "lucide-react"
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
import { formatCurrency, formatDate } from "@/lib/format"
import type { ApiResponse, Booking } from "@/types"

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
    setUpdatingId(booking.id)
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.patch(`/bookings/${booking.id}/status`, { status })
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status } : b))
      )
      toast.success(`Booking ${status === "CONFIRMED" ? "approved" : "rejected"} successfully`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Booking Requests"
          description="Approve or reject booking requests for your vehicles."
        />
        <TableSkeleton rows={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking Requests"
        description="Approve or reject booking requests for your vehicles."
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No booking requests yet"
          description="Booking requests for your vehicles will appear here."
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Rental Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <p className="font-semibold text-foreground">{booking.user?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{booking.user?.email}</p>
                    </TableCell>
                    <TableCell className="font-medium">{booking.vehicle?.name ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(booking.totalPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingId === booking.id}
                            onClick={() => updateStatus(booking, "CONFIRMED")}
                          >
                            <Check className="size-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={updatingId === booking.id}
                            onClick={() => updateStatus(booking, "REJECTED")}
                          >
                            <X className="size-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No action</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Stack View */}
          <div className="grid gap-4 md:hidden">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-base">{booking.user?.name ?? "Customer"}</h3>
                      <p className="text-xs text-muted-foreground">{booking.user?.email}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-1">
                  <p className="text-sm font-medium">Vehicle: {booking.vehicle?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    Dates: {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                  </p>
                  <div className="mt-2 flex items-center justify-between font-semibold text-sm">
                    <span>Total Price:</span>
                    <span>{formatCurrency(booking.totalPrice)}</span>
                  </div>
                </CardContent>
                {booking.status === "PENDING" && (
                  <CardFooter className="flex gap-2 p-4 pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      disabled={updatingId === booking.id}
                      onClick={() => updateStatus(booking, "CONFIRMED")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      disabled={updatingId === booking.id}
                      onClick={() => updateStatus(booking, "REJECTED")}
                    >
                      Reject
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

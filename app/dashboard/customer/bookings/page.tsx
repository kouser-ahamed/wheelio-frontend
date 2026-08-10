"use client"

import { Calendar, CreditCard, Link2, X } from "lucide-react"
import Link from "next/link"
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

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

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
    setCancellingId(booking.id)
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.patch(`/bookings/${booking.id}/cancel`)
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: "CANCELLED" } : b
        )
      )
      toast.success("Booking cancelled successfully")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCancellingId(null)
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

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Bookings" description="Review, pay for, or cancel your bookings." />
        <TableSkeleton rows={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        description="Review, pay for, or cancel your bookings."
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description="You haven't made any vehicle bookings yet."
          action={
            <Button render={<Link href="/vehicles" />}>
              <Link2 className="size-4" />
              Browse Vehicles
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Rental Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-semibold text-foreground">
                      {booking.vehicle?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(booking.totalPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {booking.paymentStatus === "UNPAID" &&
                        booking.status !== "CANCELLED" &&
                        booking.status !== "REJECTED" ? (
                          <Button size="sm" onClick={() => payBooking(booking)}>
                            <CreditCard className="size-3.5 mr-1" />
                            Pay Now
                          </Button>
                        ) : null}
                        {(booking.status === "PENDING" ||
                          booking.status === "CONFIRMED") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={cancellingId === booking.id}
                            onClick={() => cancelBooking(booking)}
                          >
                            <X className="size-3.5 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Stack View */}
          <div className="grid gap-4 md:hidden">
            {bookings.map((booking) => {
              const showPay =
                booking.paymentStatus === "UNPAID" &&
                booking.status !== "CANCELLED" &&
                booking.status !== "REJECTED"
              const showCancel =
                booking.status === "PENDING" || booking.status === "CONFIRMED"

              return (
                <Card key={booking.id}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{booking.vehicle?.name ?? "Vehicle"}</h3>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment:</span>
                      <StatusBadge status={booking.paymentStatus} />
                    </div>
                    <div className="mt-2 flex items-center justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(booking.totalPrice)}</span>
                    </div>
                  </CardContent>
                  {(showPay || showCancel) && (
                    <CardFooter className="flex gap-2 p-4 pt-0">
                      {showPay && (
                        <Button size="sm" className="flex-1" onClick={() => payBooking(booking)}>
                          Pay Now
                        </Button>
                      )}
                      {showCancel && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          disabled={cancellingId === booking.id}
                          onClick={() => cancelBooking(booking)}
                        >
                          Cancel
                        </Button>
                      )}
                    </CardFooter>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

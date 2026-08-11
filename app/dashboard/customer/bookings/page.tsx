"use client"

import { Calendar, CreditCard, Eye, Link2, Pencil, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { TableSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { EditBookingDialog } from "@/components/bookings/EditBookingDialog"
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
import type { ApiResponse, Booking, BookingStatus, PaymentStatus } from "@/types"

const BOOKING_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
}

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  REFUNDED: "Refunded",
}

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

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
          b.id === booking.id
            ? { ...b, status: "CANCELLED", paymentStatus: "REFUNDED" }
            : b
        )
      )
      toast.success("Booking cancelled and refunded")
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
                {bookings.map((booking) => {
                  const isPending = booking.status === "PENDING"
                  const needsPayment =
                    isPending && booking.paymentStatus === "UNPAID"

                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-semibold text-foreground">
                        {booking.vehicle?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={booking.status}
                          label={BOOKING_LABELS[booking.status]}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={booking.paymentStatus}
                          label={PAYMENT_LABELS[booking.paymentStatus]}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(booking.totalPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            render={
                              <Link href={`/dashboard/customer/bookings/${booking.id}`} />
                            }
                          >
                            <Eye className="size-3.5 mr-1" />
                            View
                          </Button>
                          {needsPayment ? (
                            <Button size="sm" onClick={() => payBooking(booking)}>
                              <CreditCard className="size-3.5 mr-1" />
                              Pay Now
                            </Button>
                          ) : null}
                          {isPending ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingBooking(booking)}
                              >
                                <Pencil className="size-3.5 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={cancellingId === booking.id}
                                onClick={() => cancelBooking(booking)}
                              >
                                <X className="size-3.5 mr-1" />
                                Cancel
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Stack View */}
          <div className="grid gap-4 md:hidden">
            {bookings.map((booking) => {
              const isPending = booking.status === "PENDING"
              const needsPayment =
                isPending && booking.paymentStatus === "UNPAID"

              return (
                <Card key={booking.id}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="min-w-0 font-semibold">{booking.vehicle?.name ?? "Vehicle"}</h3>
                      <StatusBadge
                        status={booking.status}
                        label={BOOKING_LABELS[booking.status]}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment:</span>
                      <StatusBadge
                        status={booking.paymentStatus}
                        label={PAYMENT_LABELS[booking.paymentStatus]}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(booking.totalPrice)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2 p-4 pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      render={
                        <Link href={`/dashboard/customer/bookings/${booking.id}`} />
                      }
                    >
                      <Eye className="size-3.5 mr-1" />
                      View
                    </Button>
                    {needsPayment ? (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => payBooking(booking)}
                      >
                        Pay Now
                      </Button>
                    ) : null}
                    {isPending ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setEditingBooking(booking)}
                        >
                          <Pencil className="size-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          disabled={cancellingId === booking.id}
                          onClick={() => cancelBooking(booking)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : null}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </>
      )}

      <EditBookingDialog
        booking={editingBooking}
        open={!!editingBooking}
        onOpenChange={(open) => {
          if (!open) setEditingBooking(null)
        }}
        onSaved={load}
      />
    </div>
  )
}
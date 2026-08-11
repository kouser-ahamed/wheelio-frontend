"use client"

import { ArrowLeft, Calendar, CreditCard, X } from "lucide-react"
import Link from "next/link"
import { use } from "react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { PageLoader } from "@/components/shared/Loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const load = async () => {
    try {
      const { default: axios } = await import("@/lib/axios")
      const res = await axios.get<ApiResponse<Booking>>(`/bookings/${id}`)
      setBooking(res.data.data ?? null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const cancelBooking = async () => {
    setCancelling(true)
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.patch(`/bookings/${id}/cancel`)
      setBooking((prev) =>
        prev
          ? { ...prev, status: "CANCELLED", paymentStatus: "REFUNDED" }
          : prev
      )
      toast.success("Booking cancelled and refunded")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <PageLoader label="Loading booking..." />

  if (!booking) {
    return (
      <div className="space-y-6">
        <PageHeader title="Booking" description="Booking not found." />
        <Button variant="outline" render={<Link href="/dashboard/customer/bookings" />}>
          <ArrowLeft className="size-4 mr-1" />
          Back to My Bookings
        </Button>
      </div>
    )
  }

  const isPending = booking.status === "PENDING"
  const needsPayment =
    isPending && booking.paymentStatus === "UNPAID"

  const payBooking = async () => {
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

  const rows = [
    { label: "Vehicle", value: booking.vehicle?.name ?? "—" },
    {
      label: "Rental Dates",
      value: `${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}`,
    },
    { label: "Booking Status", value: BOOKING_LABELS[booking.status] },
    {
      label: "Payment Status",
      value: booking.paymentStatus
        ? PAYMENT_LABELS[booking.paymentStatus]
        : "—",
    },
    {
      label: "Total Price",
      value: formatCurrency(booking.totalPrice),
    },
    {
      label: "Created At",
      value: formatDate(booking.createdAt),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking Details"
        description={booking.vehicle?.name ?? "Booking"}
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={booking.status} label={BOOKING_LABELS[booking.status]} />
        <StatusBadge
          status={booking.paymentStatus}
          label={PAYMENT_LABELS[booking.paymentStatus]}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <Calendar className="size-5 shrink-0 text-muted-foreground" />
            <h2 className="min-w-0 text-lg font-semibold">{booking.vehicle?.name ?? "Vehicle"}</h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/dashboard/customer/bookings" />}
          >
            <ArrowLeft className="size-3.5 mr-1" />
            Back
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pb-6 text-sm">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium text-right">{row.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" render={<Link href="/dashboard/customer/bookings" />}>
          <ArrowLeft className="size-4 mr-1" />
          Back to My Bookings
        </Button>
        {needsPayment ? (
          <Button onClick={payBooking}>
            <CreditCard className="size-4 mr-1" />
            Pay Now
          </Button>
        ) : null}
        {isPending ? (
          <Button variant="destructive" disabled={cancelling} onClick={cancelBooking}>
            <X className="size-4 mr-1" />
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
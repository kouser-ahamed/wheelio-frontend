"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CircleCheck, Clock, Eye, RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"

import { PageLoader } from "@/components/shared/Loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getErrorMessage } from "@/lib/axios"
import { cn } from "@/lib/utils"
import type { ApiResponse, BookingStatus, PaymentStatus } from "@/types"

interface BookingData {
  id: string
  startDate: string
  endDate: string
  totalPrice: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  vehicle?: { name?: string }
}

function formatAmount(value: string | undefined): string {
  const amount = Number(value)
  if (Number.isNaN(amount)) return "—"
  return `$${amount.toFixed(2)}`
}

function formatDate(value: string | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
}

const BOOKING_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
}

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  REFUNDED: "Refunded",
}

export function PaymentSuccessClient() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      if (!bookingId) {
        setLoading(false)
        return
      }

      const { default: axios } = await import("@/lib/axios")

      // The webhook that flips the booking to PAID fires asynchronously after
      // Stripe redirects the customer back to this page, so retry with
      // exponential backoff before declaring the booking not found.
      const backoffDelays = [1000, 2000, 4000, 8000]
      const maxAttempts = backoffDelays.length + 1
      let lastError: string | null = null

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const res = await axios.get<ApiResponse<BookingData>>(
            `/bookings/${bookingId}`
          )
          const data = res.data.data
          if (!active) return

          setBooking(data)
          setError(null)

          // Key off the BOOKING's paymentStatus: once PAID the booking is
          // settled (REFUNDED is also terminal). Keep polling otherwise rather
          // than showing a premature failure.
          if (
            data.paymentStatus === "PAID" ||
            data.paymentStatus === "REFUNDED"
          ) {
            if (active) setLoading(false)
            return
          }

          // The record exists but payment hasn't settled yet: keep polling.
          lastError = null
        } catch (err) {
          if (!active) return
          lastError = getErrorMessage(err)
        }

        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, backoffDelays[attempt]))
        }
      }

      if (!active) return
      setError(lastError)
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [bookingId])

  if (loading) return <PageLoader label="Confirming payment..." />

  const isPaid = booking?.paymentStatus === "PAID"
  const isRefunded = booking?.paymentStatus === "REFUNDED"
  const bookingStatusLabel = booking
    ? BOOKING_LABELS[booking.status] ?? booking.status
    : undefined
  const paymentStatusLabel = booking
    ? PAYMENT_LABELS[booking.paymentStatus] ?? booking.paymentStatus
    : undefined

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader className="items-center pb-2 text-center">
          <div
            className={cn(
              "animate-pop-in mb-4 flex size-16 items-center justify-center rounded-full",
              isPaid
                ? "bg-emerald-500/10"
                : isRefunded
                  ? "bg-red-500/10"
                  : "bg-amber-500/10"
            )}
          >
            {isPaid ? (
              <CircleCheck className="size-8 text-emerald-500" />
            ) : isRefunded ? (
              <RotateCcw className="size-8 text-red-500" />
            ) : (
              <Clock className="size-8 text-amber-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isPaid
              ? "Payment successful"
              : isRefunded
                ? "Payment refunded"
                : "Payment is being processed"}
          </CardTitle>
          <CardDescription>
            {isPaid
              ? "We&apos;ve received your payment. The vendor will confirm your booking shortly."
              : isRefunded
                ? "The vendor did not approve your booking, so your payment has been refunded."
                : "We&apos;re confirming your payment. You can check your bookings for the latest status."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error || !booking ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center text-sm text-destructive">
              {error ?? "No booking reference was found."}
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <Badge
                  variant="secondary"
                  className={cn(
                    "border-transparent",
                    isPaid
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : isRefunded
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  )}
                >
                  {paymentStatusLabel ?? booking.paymentStatus}
                </Badge>
              </div>

              <div className="space-y-3 rounded-lg border p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Vehicle</span>
                  <span className="truncate font-medium">
                    {booking.vehicle?.name ?? "Vehicle"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Dates</span>
                  <span className="font-medium">
                    {formatDate(booking.startDate)} –{" "}
                    {formatDate(booking.endDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-medium">
                    {paymentStatusLabel ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Booking</span>
                  <span className="font-medium">
                    {bookingStatusLabel ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t pt-3">
                  <span className="text-muted-foreground">Amount paid</span>
                  <span className="text-lg font-bold">
                    {formatAmount(booking.totalPrice)}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-3">
            <Button
              render={<Link href={`/dashboard/customer/bookings/${bookingId}`} />}
            >
              <Eye className="size-4 mr-1" />
              View Booking Details
            </Button>
            <Button variant="outline" render={<Link href="/dashboard/customer/bookings" />}>
              Go to My Bookings
            </Button>
            <Button variant="outline" render={<Link href="/vehicles" />}>
              Browse more vehicles
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
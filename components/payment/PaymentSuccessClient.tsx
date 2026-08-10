"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CircleCheck, Clock } from "lucide-react"
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
import type { ApiResponse, PaymentStatus } from "@/types"

interface BookingSummary {
  id: string
  vehicleId: string
  startDate: string
  endDate: string
  totalPrice: string
  status: string
  paymentStatus: string
}

interface PaymentData {
  id: string
  bookingId: string
  amount: string | number
  currency: string
  status: PaymentStatus
  booking?: BookingSummary
}

function formatAmount(payment: PaymentData): string {
  const amount = Number(payment.amount)
  if (Number.isNaN(amount)) {
    const fallback = Number(payment.booking?.totalPrice)
    if (!Number.isNaN(fallback)) return `$${fallback.toFixed(2)}`
    return "—"
  }
  const currency = (payment.currency || "usd").toUpperCase()
  return `${currency === "USD" ? "$" : `${currency} `}${amount.toFixed(2)}`
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

export function PaymentSuccessClient() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [vehicleName, setVehicleName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      if (!bookingId) {
        setLoading(false)
        return
      }
      try {
        const { default: axios } = await import("@/lib/axios")
        const res = await axios.get<ApiResponse<PaymentData>>(
          `/payments/${bookingId}`
        )
        const data = res.data.data
        if (!active) return
        setPayment(data)

        if (data.booking?.vehicleId) {
          try {
            const vehicleRes = await axios.get<
              ApiResponse<{ name: string }>
            >(`/vehicles/${data.booking.vehicleId}`)
            if (active) setVehicleName(vehicleRes.data.data.name)
          } catch {
            // vehicle name is optional for the summary
          }
        }
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
  }, [bookingId])

  if (loading) return <PageLoader label="Confirming payment..." />

  const isPaid = payment?.status === "PAID"
  const summary = payment?.booking

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader className="items-center pb-2 text-center">
          <div
            className={cn(
              "animate-pop-in mb-4 flex size-16 items-center justify-center rounded-full",
              isPaid ? "bg-emerald-500/10" : "bg-amber-500/10"
            )}
          >
            {isPaid ? (
              <CircleCheck className="size-8 text-emerald-500" />
            ) : (
              <Clock className="size-8 text-amber-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isPaid ? "Payment successful" : "Payment is being processed"}
          </CardTitle>
          <CardDescription>
            {isPaid
              ? "Your booking has been confirmed. Thank you for choosing Wheelio!"
              : "We&apos;re confirming your payment. You can check your bookings for the latest status."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error || !payment ? (
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
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  )}
                >
                  {payment.status}
                </Badge>
              </div>

              <div className="space-y-3 rounded-lg border p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Vehicle</span>
                  <span className="truncate font-medium">
                    {vehicleName ?? "Vehicle"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Dates</span>
                  <span className="font-medium">
                    {formatDate(summary?.startDate)} –{" "}
                    {formatDate(summary?.endDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t pt-3">
                  <span className="text-muted-foreground">Amount paid</span>
                  <span className="text-lg font-bold">
                    {formatAmount(payment)}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-3">
            <Button render={<Link href="/dashboard/customer/bookings" />}>
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

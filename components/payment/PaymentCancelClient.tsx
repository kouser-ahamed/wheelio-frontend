"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { OctagonAlert } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ApiResponse, Booking } from "@/types"

export function PaymentCancelClient() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [vehicleId, setVehicleId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      if (!bookingId) {
        setLoading(false)
        return
      }
      try {
        const { default: axios } = await import("@/lib/axios")
        const res = await axios.get<ApiResponse<Booking>>(
          `/bookings/${bookingId}`
        )
        if (active && res.data.data?.vehicleId) {
          setVehicleId(res.data.data.vehicleId)
        }
      } catch {
        // fall back to the general vehicles page
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [bookingId])

  const tryAgainHref = vehicleId ? `/vehicles/${vehicleId}` : "/vehicles"

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader className="items-center pb-2 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-amber-500/10">
            <OctagonAlert className="size-8 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">Payment cancelled</CardTitle>
          <CardDescription>
            Your payment was not completed and no money was charged. Your
            booking is still pending — you can try again whenever you&apos;re
            ready.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-3 rounded-lg border p-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Booking reference</span>
              <span className="truncate font-medium">
                {bookingId ?? "—"}
              </span>
            </div>
            {loading ? (
              <p className="text-xs text-muted-foreground">
                Looking up your booking…
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <Button render={<Link href={tryAgainHref} />}>Try Again</Button>
            <Button
              variant="outline"
              render={<Link href="/dashboard/customer/bookings" />}
            >
              Back to My Bookings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

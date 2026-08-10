"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Booking } from "@/types"

interface ViewBookingDialogProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewBookingDialog({
  booking,
  open,
  onOpenChange,
}: ViewBookingDialogProps) {
  const rows = booking
    ? [
        { label: "Customer", value: booking.user?.name ?? "—" },
        { label: "Email", value: booking.user?.email ?? "—" },
        { label: "Vehicle", value: booking.vehicle?.name ?? "—" },
        {
          label: "Rental Dates",
          value: `${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}`,
        },
        { label: "Total Price", value: formatCurrency(booking.totalPrice) },
        { label: "Created At", value: formatDate(booking.createdAt) },
      ]
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            {booking?.vehicle?.name ?? "Booking"}
          </DialogDescription>
        </DialogHeader>

        {booking ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={booking.status} />
              <StatusBadge status={booking.paymentStatus} />
            </div>
            <div className="space-y-2 rounded-lg border p-4 text-sm">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="max-w-[60%] truncate text-right font-medium">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
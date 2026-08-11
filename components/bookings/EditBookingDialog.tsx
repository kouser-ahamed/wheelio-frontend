"use client"

import { Calendar, Save } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/axios"
import { formatCurrency } from "@/lib/format"
import type { ApiResponse, Booking } from "@/types"

function toDateInput(value: string): string {
  const date = new Date(value)
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return Number.isNaN(local.getTime())
    ? value
    : local.toISOString().split("T")[0]
}

interface EditBookingDialogProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function EditBookingDialog({
  booking,
  open,
  onOpenChange,
  onSaved,
}: EditBookingDialogProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && booking) {
      setStartDate(toDateInput(booking.startDate))
      setEndDate(toDateInput(booking.endDate))
    }
  }, [open, booking])

  const selectedStart = new Date(startDate)
  const minEnd = startDate
    ? new Date(selectedStart.getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
    : undefined

  const days = (() => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) return 0
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  })()

  const pricePerDay = booking?.vehicle?.pricePerDay
    ? parseFloat(booking.vehicle.pricePerDay)
    : 0

  const datesInvalid = !startDate || !endDate || days <= 0

  const submit = async () => {
    if (!booking) return
    setSaving(true)
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.patch<ApiResponse<Booking>>(`/bookings/${booking.id}`, {
        startDate,
        endDate,
      })
      toast.success("Booking dates updated")
      onSaved()
      onOpenChange(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Update the rental dates for {booking?.vehicle?.name ?? "this booking"}.
            Payment is not affected.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-start-date">Start date</Label>
            <Input
              id="edit-start-date"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-end-date">End date</Label>
            <Input
              id="edit-end-date"
              type="date"
              min={minEnd}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {days > 0 ? (
          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4" />
              {days} day{days === 1 ? "" : "s"}
            </span>
            <span className="font-semibold">
              {formatCurrency(pricePerDay * days)}
            </span>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            onClick={submit}
            disabled={saving || datesInvalid}
          >
            <Save className="size-4 mr-1" />
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
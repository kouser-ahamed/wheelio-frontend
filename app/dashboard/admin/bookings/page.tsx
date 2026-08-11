"use client"

import { Calendar, Eye, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { TableSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { ViewBookingDialog } from "@/components/bookings/ViewBookingDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null)

  const load = async () => {
    try {
      const { default: axios } = await import("@/lib/axios")
      const res = await axios.get<ApiResponse<Booking[]>>("/bookings", {
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

  const deleteBooking = async (booking: Booking) => {
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.delete(`/bookings/${booking.id}`)
      setBookings((prev) => prev.filter((b) => b.id !== booking.id))
      toast.success("Booking deleted successfully")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === "ALL") return true
    return booking.status === statusFilter
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="All Bookings" description="System-wide rental bookings overview." />
        <TableSkeleton rows={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Bookings"
        description="System-wide rental bookings overview and management."
      />

      {/* Status Filter */}
      <div className="flex justify-end">
        <div className="w-full sm:w-56">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "ALL")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description="No bookings matched the selected status filter."
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border bg-card shadow-sm">
            <Table className="xl:table-fixed">
              <colgroup>
                <col className="xl:w-[14%]" />
                <col className="xl:w-[12%]" />
                <col className="xl:w-[12%]" />
                <col className="xl:w-[13%]" />
                <col className="xl:w-[9%]" />
                <col className="xl:w-[10%]" />
                <col className="xl:w-[11%]" />
                <col className="xl:w-[19%]" />
              </colgroup>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="overflow-hidden">
                      <p className="max-w-28 truncate font-semibold text-foreground">
                        {booking.user?.name ?? "—"}
                      </p>
                      <p className="max-w-28 truncate text-xs text-muted-foreground">
                        {booking.user?.email}
                      </p>
                    </TableCell>
                    <TableCell className="overflow-hidden font-medium">
                      <p className="max-w-28 truncate">{booking.vehicle?.name ?? "—"}</p>
                    </TableCell>
                    <TableCell className="overflow-hidden text-sm text-muted-foreground">
                      <p className="max-w-28 truncate">{booking.vehicle?.vendor?.name ?? "—"}</p>
                    </TableCell>
                    <TableCell className="whitespace-normal text-xs text-muted-foreground">
                      <p className="max-w-36">{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</p>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingBooking(booking)}
                        >
                          <Eye className="size-3.5 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteBooking(booking)}
                        >
                          <Trash2 className="size-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Stack View */}
          <div className="grid gap-4 md:hidden">
            {filteredBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-base">{booking.user?.name ?? "Customer"}</h3>
                      <p className="truncate text-xs text-muted-foreground">{booking.user?.email}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-1 text-xs">
                  <p><span className="font-medium text-foreground">Vehicle:</span> {booking.vehicle?.name ?? "—"}</p>
                  <p><span className="font-medium text-foreground">Vendor:</span> {booking.vehicle?.vendor?.name ?? "—"}</p>
                  <p><span className="font-medium text-foreground">Dates:</span> {formatDate(booking.startDate)} → {formatDate(booking.endDate)}</p>
                  <div className="mt-2 flex items-center gap-2">
                      <StatusBadge status={booking.status} />
                      <StatusBadge status={booking.paymentStatus} />
                    </div>
                    <div className="mt-2 flex items-center justify-between font-semibold text-sm">
                    <span>Total:</span>
                    <span>{formatCurrency(booking.totalPrice)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 p-4 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewingBooking(booking)}
                  >
                    <Eye className="size-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => deleteBooking(booking)}
                  >
                    <Trash2 className="size-4 mr-1" />
                    Delete Booking
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      <ViewBookingDialog
        booking={viewingBooking}
        open={!!viewingBooking}
        onOpenChange={(open) => {
          if (!open) setViewingBooking(null)
        }}
      />
    </div>
  )
}

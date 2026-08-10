"use client"

import { CalendarDays, Car, DollarSign, Hourglass } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard, StatCardGrid } from "@/components/dashboard/StatCard"
import { StatCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { getErrorMessage } from "@/lib/axios"
import { formatCurrency } from "@/lib/format"
import type { ApiResponse, DashboardStats } from "@/types"

export default function VendorOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { default: axios } = await import("@/lib/axios")
        const res = await axios.get<ApiResponse<{ stats: DashboardStats }>>(
          "/dashboard/vendor-stats"
        )
        if (active) {
          setStats(res.data.data.stats)
        }
      } catch (err) {
        if (active) {
          toast.error(getErrorMessage(err))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Vendor Overview"
        description="Monitor your fleet performance, earnings, and booking requests."
      />

      {loading ? (
        <StatCardSkeleton count={4} />
      ) : (
        <StatCardGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Car}
            label="Total Vehicles"
            value={stats?.totalVehicles ?? 0}
          />
          <StatCard
            icon={CalendarDays}
            label="Total Bookings"
            value={stats?.totalBookings ?? 0}
          />
          <StatCard
            icon={DollarSign}
            label="Total Earnings"
            value={formatCurrency(stats?.totalEarnings ?? stats?.totalSpent ?? 0)}
          />
          <StatCard
            icon={Hourglass}
            label="Pending Bookings"
            value={stats?.pendingBookings ?? 0}
          />
        </StatCardGrid>
      )}
    </div>
  )
}

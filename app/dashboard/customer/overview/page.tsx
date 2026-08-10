"use client"

import { CalendarDays, ClipboardList, Heart, Wallet } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard, StatCardGrid } from "@/components/dashboard/StatCard"
import { StatCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { getErrorMessage } from "@/lib/axios"
import { formatCurrency } from "@/lib/format"
import type { ApiResponse, DashboardStats } from "@/types"

export default function CustomerOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { default: axios } = await import("@/lib/axios")
        const res = await axios.get<ApiResponse<{ stats: DashboardStats }>>(
          "/dashboard/customer-stats"
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
        title="Customer Overview"
        description="Here is an overview of your bookings, wishlist, and spending."
      />

      {loading ? (
        <StatCardSkeleton count={4} />
      ) : (
        <StatCardGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={CalendarDays}
            label="Total Bookings"
            value={stats?.totalBookings ?? 0}
          />
          <StatCard
            icon={ClipboardList}
            label="Active Bookings"
            value={stats?.activeBookings ?? 0}
          />
          <StatCard
            icon={Wallet}
            label="Total Spent"
            value={formatCurrency(stats?.totalSpent ?? 0)}
          />
          <StatCard
            icon={Heart}
            label="Wishlist Count"
            value={stats?.wishlistCount ?? 0}
          />
        </StatCardGrid>
      )}
    </div>
  )
}

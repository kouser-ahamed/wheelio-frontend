"use client"

import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Heart, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { CardGridSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { getErrorMessage } from "@/lib/axios"
import { formatCurrency } from "@/lib/format"
import type { ApiResponse, Wishlist } from "@/types"

export default function WishlistPage() {
  const [items, setItems] = useState<Wishlist[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { default: axios } = await import("@/lib/axios")
      const res = await axios.get<ApiResponse<Wishlist[]>>("/wishlist/my-wishlist", {
        params: { limit: 100 },
      })
      setItems(res.data.data ?? [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const remove = async (item: Wishlist) => {
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.delete(`/wishlist/${item.id}`)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      toast.success("Removed from wishlist")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Wishlist"
          description="Vehicles you've saved for later."
        />
        <CardGridSkeleton count={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Wishlist"
        description="Vehicles you've saved for later."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Explore our vehicles fleet and tap the heart icon on any vehicle to save it here."
          action={
            <Button render={<Link href="/vehicles" />}>Browse Vehicles</Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <Link href={`/vehicles/${item.vehicleId}`}>
                  <div className="relative aspect-[16/10] w-full bg-muted">
                    {item.vehicle?.images?.[0] ? (
                      <Image
                        src={item.vehicle.images[0]}
                        alt={item.vehicle.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform hover:scale-105"
                      />
                    ) : null}
                  </div>
                </Link>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-base">{item.vehicle?.name ?? "Vehicle"}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.vehicle?.category?.name ?? "—"}
                </p>
                {item.vehicle ? (
                  <p className="mt-2 font-bold text-primary">
                    {formatCurrency(item.vehicle.pricePerDay)}
                    <span className="text-xs font-normal text-muted-foreground">
                      /day
                    </span>
                  </p>
                ) : null}
              </CardContent>
              <CardFooter className="gap-2 p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  render={<Link href={`/vehicles/${item.vehicleId}`} />}
                >
                  <ExternalLink className="size-4 mr-1" />
                  View Details
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => remove(item)}
                >
                  <Trash2 className="size-4 mr-1" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

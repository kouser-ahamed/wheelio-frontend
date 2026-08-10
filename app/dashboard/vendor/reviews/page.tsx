"use client"

import { Star } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CardGridSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { getErrorMessage } from "@/lib/axios"
import { formatDate } from "@/lib/format"
import type { ApiResponse, Review, Vehicle } from "@/types"

interface VehicleReviewItem {
  review: Review
  vehicleName: string
}

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<VehicleReviewItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function loadReviews() {
      try {
        const { default: axios } = await import("@/lib/axios")
        const vehiclesRes = await axios.get<ApiResponse<Vehicle[]>>("/vehicles/my-vehicles", {
          params: { limit: 100 },
        })
        const vehicles = vehiclesRes.data.data ?? []

        const reviewPromises = vehicles.map(async (v) => {
          try {
            const revRes = await axios.get<ApiResponse<Review[]>>(`/reviews/vehicle/${v.id}`)
            const revs = revRes.data.data ?? []
            return revs.map((r) => ({ review: r, vehicleName: v.name }))
          } catch {
            return (v.reviews ?? []).map((r) => ({ review: r, vehicleName: v.name }))
          }
        })

        const results = await Promise.all(reviewPromises)
        const combined = results.flat()

        if (active) {
          setReviews(combined)
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
    loadReviews()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customer Reviews" description="Feedback from customers who rented your vehicles." />
        <CardGridSkeleton count={4} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Reviews"
        description="Feedback from customers who rented your vehicles."
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Reviews submitted by customers after completed rentals will appear here."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map(({ review, vehicleName }) => (
            <Card key={review.id} className="flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                      {review.user?.profileImage ? (
                        <AvatarImage src={review.user.profileImage} alt={review.user.name} />
                      ) : null}
                      <AvatarFallback className="text-xs font-semibold">
                        {review.user?.name ? review.user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{review.user?.name ?? "Customer"}</p>
                      <p className="text-xs text-muted-foreground">{vehicleName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                    <span>{review.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                {review.comment ? (
                  <p className="text-sm text-foreground italic">&ldquo;{review.comment}&rdquo;</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No written comment provided.</p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  {formatDate(review.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

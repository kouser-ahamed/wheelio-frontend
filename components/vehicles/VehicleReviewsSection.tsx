"use client"

import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Pencil,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/lib/auth-store"
import { getErrorMessage } from "@/lib/axios"
import { cn } from "@/lib/utils"
import type { ReactionType, Review, Vehicle } from "@/types"

interface VehicleReviewsSectionProps {
  vehicle: Vehicle
  reviews: Review[]
  refreshReviews: () => Promise<void>
}

function StarRating({
  value,
  onChange,
  disabled,
  size = "size-5",
}: {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  size?: string
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => onChange(i)}
          className={cn("transition-transform", !disabled && "hover:scale-110")}
          aria-label={`${i} star${i === 1 ? "" : "s"}`}
        >
          <Star
            className={cn(
              size,
              i <= value ? "fill-amber-400 text-amber-400" : "text-muted"
            )}
          />
        </button>
      ))}
    </div>
  )
}

export function VehicleReviewsSection({
  vehicle,
  reviews,
  refreshReviews,
}: VehicleReviewsSectionProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Review | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [busyReaction, setBusyReaction] = useState<string | null>(null)
  const [busyDelete, setBusyDelete] = useState<string | null>(null)

  const isCustomer = isAuthenticated && user?.role === "CUSTOMER"
  const isAdmin = isAuthenticated && user?.role === "ADMIN"
  const ownReview = reviews.find((review) => review.userId === user?.id)

  const requireCustomer = (): boolean => {
    if (!isAuthenticated || !user) {
      router.push(`/login?redirect=${encodeURIComponent(`/vehicles/${vehicle.id}`)}`)
      return false
    }
    if (user.role !== "CUSTOMER") {
      toast.error("Only customers can review vehicles")
      return false
    }
    return true
  }

  const openCreate = () => {
    if (!requireCustomer()) return
    setEditing(null)
    setRating(5)
    setComment("")
    setDialogOpen(true)
  }

  const openEdit = (review: Review) => {
    if (user?.id !== review.userId && user?.role !== "ADMIN") return
    setEditing(review)
    setRating(review.rating)
    setComment(review.comment ?? "")
    setDialogOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!user) return
    setSubmitting(true)
    try {
      const { default: axios } = await import("@/lib/axios")
      if (editing) {
        await axios.patch(`/reviews/${editing.id}`, { rating, comment })
        toast.success("Review updated successfully")
      } else {
        await axios.post("/reviews", {
          vehicleId: vehicle.id,
          rating,
          comment,
        })
        toast.success("Review submitted successfully")
      }
      setDialogOpen(false)
      await refreshReviews()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (review: Review) => {
    if (busyDelete) return
    setBusyDelete(review.id)
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.delete(`/reviews/${review.id}`)
      toast.success("Review deleted successfully")
      await refreshReviews()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusyDelete(null)
    }
  }

  const handleReact = async (review: Review, type: ReactionType) => {
    if (!requireCustomer()) return
    if (review.userId === user?.id) {
      toast.error("You cannot react to your own review")
      return
    }
    if (busyReaction) return
    setBusyReaction(review.id)
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.post(`/reviews/${review.id}/react`, { type })
      await refreshReviews()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusyReaction(null)
    }
  }

  const canManage = (review: Review) =>
    isAdmin || (isAuthenticated && user?.id === review.userId)

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Reviews</h2>
        {isCustomer && ownReview ? (
          <Button variant="outline" size="sm" onClick={() => openEdit(ownReview)}>
            <Pencil className="size-3.5 mr-1" />
            Edit your review
          </Button>
        ) : isCustomer || !isAuthenticated ? (
          <Button size="sm" onClick={openCreate}>
            <Star className="size-3.5 mr-1" />
            Write a review
          </Button>
        ) : null}
      </div>

      {reviews.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {reviews.map((review) => (
            <Card key={review.id} className="flex flex-col">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Avatar>
                  {review.user?.profileImage ? (
                    <AvatarImage
                      src={review.user.profileImage}
                      alt={review.user.name}
                    />
                  ) : null}
                  <AvatarFallback>
                    {review.user?.name ? review.user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {review.user?.name ?? "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3.5",
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {review.comment ?? "No comment."}
                </p>

                {review.reply ? (
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold">
                      <MessageSquare className="size-3.5 text-primary" />
                      Vendor reply
                      {review.reply.vendor?.name ? ` · ${review.reply.vendor.name}` : null}
                    </p>
                    <p className="mt-1 text-sm">{review.reply.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(review.reply.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyReaction === review.id}
                      onClick={() => handleReact(review, "LIKE")}
                      className={cn(
                        review.myReaction?.type === "LIKE" &&
                          "border-primary bg-primary/10 text-primary"
                      )}
                    >
                      <ThumbsUp className="size-3.5" />
                      {review.likeCount ?? 0}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyReaction === review.id}
                      onClick={() => handleReact(review, "DISLIKE")}
                      className={cn(
                        review.myReaction?.type === "DISLIKE" &&
                          "border-destructive bg-destructive/10 text-destructive"
                      )}
                    >
                      <ThumbsDown className="size-3.5" />
                      {review.dislikeCount ?? 0}
                    </Button>
                  </div>

                  {canManage(review) ? (
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(review)}
                      >
                        <Pencil className="size-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={busyDelete === review.id}
                        onClick={() => handleDelete(review)}
                      >
                        <Trash2 className="size-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Be the first to share your experience with this vehicle."
          className="mt-6"
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit your review" : "Write a review"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update your rating and feedback for this vehicle."
                : "Share your experience with this vehicle."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-comment">Comment</Label>
              <Textarea
                id="review-comment"
                rows={4}
                placeholder="Tell others about your rental experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={handleSubmitReview}
            >
              {submitting ? "Saving..." : editing ? "Save changes" : "Submit review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

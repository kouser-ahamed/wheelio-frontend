"use client"

import { Loader2, MessageSquare, Pencil, Reply, Star, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CardGridSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { getErrorMessage } from "@/lib/axios"
import { formatDate } from "@/lib/format"
import type { ApiResponse, Review, ReviewReply, Vehicle } from "@/types"

interface VehicleReviewItem {
  review: Review
  vehicleName: string
}

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<VehicleReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingReply, setEditingReply] = useState<{ reviewId: string; content: string } | null>(null)
  const [replyDraft, setReplyDraft] = useState("")
  const [savingReply, setSavingReply] = useState(false)
  const [deletingReply, setDeletingReply] = useState<string | null>(null)

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
            const revRes = await axios.get<ApiResponse<Review[]>>(`/reviews/vehicle/${v.id}`, {
              params: { limit: 100 },
            })
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

  const updateReviewReply = (reviewId: string, reply: ReviewReply | null) => {
    setReviews((prev) =>
      prev.map((item) =>
        item.review.id === reviewId ? { ...item, review: { ...item.review, reply } } : item
      )
    )
  }

  const startReply = (reviewId: string) => {
    setEditingReply(null)
    setReplyDraft("")
    setReplyingTo(reviewId)
  }

  const startEditReply = (reviewId: string, content: string) => {
    setReplyingTo(null)
    setEditingReply({ reviewId, content })
  }

  const saveReply = async (reviewId: string) => {
    if (!replyDraft.trim()) {
      toast.error("Reply cannot be empty")
      return
    }
    setSavingReply(true)
    try {
      const { default: axios } = await import("@/lib/axios")
      const res = await axios.post<ApiResponse<ReviewReply>>(
        `/reviews/${reviewId}/reply`,
        { content: replyDraft.trim() }
      )
      toast.success("Reply submitted successfully")
      updateReviewReply(reviewId, res.data.data)
      setReplyingTo(null)
      setReplyDraft("")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSavingReply(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customer Reviews" description="Feedback and ratings from customers for your vehicles." />
        <CardGridSkeleton count={4} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Reviews"
        description="Feedback and ratings from customers for your vehicles."
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Reviews submitted by customers will appear here."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map(({ review, vehicleName }) => (
            <Card key={review.id} className="flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="size-8 shrink-0">
                      {review.user?.profileImage ? (
                        <AvatarImage src={review.user.profileImage} alt={review.user.name} />
                      ) : null}
                      <AvatarFallback className="text-xs font-semibold">
                        {review.user?.name ? review.user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{review.user?.name ?? "Customer"}</p>
                      <p className="truncate text-xs text-muted-foreground">{vehicleName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                    <span>{review.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3">
                {review.comment ? (
                  <p className="text-sm text-foreground italic">&ldquo;{review.comment}&rdquo;</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No written comment provided.</p>
                )}
                <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>

                {review.reply ? (
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-xs font-semibold">
                        <MessageSquare className="size-3.5 text-primary" />
                        Your reply
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditReply(review.id, review.reply!.content)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingReply === review.id}
                          onClick={async () => {
                            setDeletingReply(review.id)
                            try {
                              const { default: axios } = await import("@/lib/axios")
                              await axios.delete(`/reviews/${review.id}/reply`)
                              toast.success("Reply deleted successfully")
                              updateReviewReply(review.id, null)
                            } catch (err) {
                              toast.error(getErrorMessage(err))
                            } finally {
                              setDeletingReply(null)
                            }
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm">{review.reply.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(review.reply.updatedAt)}
                    </p>
                  </div>
                ) : replyingTo === review.id ? (
                  <div className="space-y-2">
                    <Textarea
                      rows={3}
                      placeholder="Write a public reply to this customer..."
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={savingReply}
                        onClick={() => saveReply(review.id)}
                      >
                        {savingReply && <Loader2 className="size-3.5 animate-spin mr-1" />}
                        Post reply
                      </Button>
                    </div>
                  </div>
                ) : editingReply?.reviewId === review.id ? (
                  <div className="space-y-2">
                    <Textarea
                      rows={3}
                      placeholder="Write a public reply to this customer..."
                      value={editingReply.content}
                      onChange={(e) =>
                        setEditingReply((prev) => (prev ? { ...prev, content: e.target.value } : prev))
                      }
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingReply(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={savingReply}
                        onClick={async () => {
                          if (!editingReply?.content.trim()) {
                            toast.error("Reply cannot be empty")
                            return
                          }
                          setSavingReply(true)
                          try {
                            const { default: axios } = await import("@/lib/axios")
                            const res = await axios.patch<ApiResponse<ReviewReply>>(
                              `/reviews/${review.id}/reply`,
                              { content: editingReply.content.trim() }
                            )
                            toast.success("Reply updated successfully")
                            updateReviewReply(review.id, res.data.data)
                            setEditingReply(null)
                          } catch (err) {
                            toast.error(getErrorMessage(err))
                          } finally {
                            setSavingReply(false)
                          }
                        }}
                      >
                        {savingReply && <Loader2 className="size-3.5 animate-spin mr-1" />}
                        Save changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startReply(review.id)}
                  >
                    <Reply className="size-3.5 mr-1" />
                    Reply
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

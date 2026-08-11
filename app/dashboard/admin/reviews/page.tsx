"use client"

import {
  Loader2,
  MessageSquare,
  Pencil,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { TableSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getErrorMessage } from "@/lib/axios"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ApiResponse, Review } from "@/types"

function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
          aria-label={`${i} star${i === 1 ? "" : "s"}`}
        >
          <Star
            className={cn(
              "size-6",
              i <= value ? "fill-amber-400 text-amber-400" : "text-muted"
            )}
          />
        </button>
      ))}
    </div>
  )
}

function ReactionsDialog({
  review,
  onClose,
  onReactionDeleted,
}: {
  review: Review | null
  onClose: () => void
  onReactionDeleted: () => void
}) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const deleteReaction = async (reactionId: string) => {
    setDeleting(reactionId)
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.delete(`/reviews/${review.id}/react/${reactionId}`)
      toast.success("Reaction deleted successfully")
      onReactionDeleted()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Dialog open={!!review} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reactions</DialogTitle>
          <DialogDescription>
            Moderate individual reactions on this review. Deleting a reaction does not remove
            the review itself.
          </DialogDescription>
        </DialogHeader>

        {review?.reactions && review.reactions.length > 0 ? (
          <div className="space-y-2">
            {review.reactions.map((reaction) => (
              <div
                key={reaction.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  {reaction.type === "LIKE" ? (
                    <ThumbsUp className="size-4 text-primary" />
                  ) : (
                    <ThumbsDown className="size-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">
                    {reaction.user?.name ?? "Unknown user"}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleting === reaction.id}
                  onClick={() => deleteReaction(reaction.id)}
                >
                  {deleting === reaction.id ? (
                    <Loader2 className="size-3.5 animate-spin mr-1" />
                  ) : null}
                  <Trash2 className="size-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No reactions on this review.</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editReview, setEditReview] = useState<Review | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deletingReply, setDeletingReply] = useState<string | null>(null)
  const [reactionsReview, setReactionsReview] = useState<Review | null>(null)

  const load = async () => {
    try {
      const { default: axios } = await import("@/lib/axios")
      const res = await axios.get<ApiResponse<Review[]>>("/reviews", {
        params: { limit: 100 },
      })
      setReviews(res.data.data ?? [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openEdit = (review: Review) => {
    setEditReview(review)
    setEditRating(review.rating)
    setEditComment(review.comment ?? "")
  }

  const saveEdit = async () => {
    if (!editReview) return
    setSaving(true)
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.patch(`/reviews/${editReview.id}`, {
        rating: editRating,
        comment: editComment,
      })
      toast.success("Review updated successfully")
      setEditReview(null)
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const deleteReview = async (review: Review) => {
    setDeleting(review.id)
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.delete(`/reviews/${review.id}`)
      setReviews((prev) => prev.filter((r) => r.id !== review.id))
      toast.success("Review deleted successfully")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(null)
    }
  }

  const deleteReply = async (review: Review) => {
    setDeletingReply(review.id)
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.delete(`/reviews/${review.id}/reply`)
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, reply: null } : r))
      )
      toast.success("Reply deleted successfully")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeletingReply(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reviews" description="Moderate reviews and individual reactions." />
        <TableSkeleton rows={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="View, edit, or delete reviews and moderate individual like/dislike reactions."
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews found"
          description="There are currently no reviews in the platform."
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Reply</TableHead>
                  <TableHead>Reactions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
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
                          <p className="font-medium text-foreground">
                            {review.user?.name ?? "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{review.vehicle?.name ?? "—"}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="size-4 fill-amber-500 text-amber-500" />
                        {review.rating}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {review.comment ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      {review.reply ? (
                        <div className="space-y-1">
                          <p className="flex items-start gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-primary" />
                            <span className="line-clamp-2">{review.reply.content}</span>
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                            disabled={deletingReply === review.id}
                            onClick={() => deleteReply(review)}
                          >
                            <Trash2 className="size-3 mr-1" />
                            Delete reply
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReactionsReview(review)}
                      >
                        <ThumbsUp className="size-3.5 mr-1" />
                        {review.likeCount ?? 0}
                        <ThumbsDown className="size-3.5 mx-1" />
                        {review.dislikeCount ?? 0}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(review)}>
                          <Pencil className="size-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleting === review.id}
                          onClick={() => deleteReview(review)}
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

          {/* Mobile Card Grid View */}
          <div className="grid gap-6 sm:grid-cols-2 md:hidden">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                      {review.user?.profileImage ? (
                        <AvatarImage src={review.user.profileImage} alt={review.user.name} />
                      ) : null}
                      <AvatarFallback className="text-xs font-semibold">
                        {review.user?.name ? review.user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {review.user?.name ?? "Anonymous"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {review.vehicle?.name ?? "—"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-2">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                    <span>{review.rating}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      · {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment ?? "No comment."}</p>
                  {review.reply ? (
                    <div className="space-y-1">
                      <p className="flex items-start gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span className="line-clamp-2">Reply: {review.reply.content}</span>
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                        disabled={deletingReply === review.id}
                        onClick={() => deleteReply(review)}
                      >
                        <Trash2 className="size-3 mr-1" />
                        Delete reply
                      </Button>
                    </div>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setReactionsReview(review)}
                  >
                    <ThumbsUp className="size-3.5 mr-1" />
                    {review.likeCount ?? 0}
                    <ThumbsDown className="size-3.5 mx-1" />
                    {review.dislikeCount ?? 0}
                  </Button>
                </CardContent>
                <CardFooter className="gap-2 p-4 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(review)}
                  >
                    <Pencil className="size-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    disabled={deleting === review.id}
                    onClick={() => deleteReview(review)}
                  >
                    <Trash2 className="size-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={!!editReview} onOpenChange={(open) => !open && setEditReview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit review</DialogTitle>
            <DialogDescription>
              Update the rating and comment for this review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <StarRatingInput value={editRating} onChange={setEditRating} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-review-comment">Comment</Label>
              <Textarea
                id="admin-review-comment"
                rows={4}
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditReview(null)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={saveEdit}>
              {saving && <Loader2 className="size-4 animate-spin mr-1" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReactionsDialog
        review={reactionsReview}
        onClose={() => setReactionsReview(null)}
        onReactionDeleted={load}
      />
    </div>
  )
}

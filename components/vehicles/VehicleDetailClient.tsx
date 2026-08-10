"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BadgeCheck,
  CalendarDays,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
  Truck,
  User as UserIcon,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageLoader } from "@/components/shared/Loader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/lib/auth-store"
import { getErrorMessage } from "@/lib/axios"
import { cn } from "@/lib/utils"
import type { ApiResponse, Review, Vehicle, Wishlist } from "@/types"

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  BOOKED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  MAINTENANCE: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  INACTIVE: "bg-muted text-muted-foreground",
}

const TOOLTIP = "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 shadow transition-opacity group-hover:opacity-100"

function BookingTooltip({
  reason,
  children,
}: {
  reason: string | null
  children: React.ReactNode
}) {
  return (
    <span className={cn("group relative block", reason ? "" : "cursor-not-allowed")}>
      {children}
      {reason ? <span className={TOOLTIP}>{reason}</span> : null}
    </span>
  )
}

export function VehicleDetailClient({ vehicleId }: { vehicleId: string }) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [wishlisted, setWishlisted] = useState(false)

  const loadVehicle = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { default: axios } = await import("@/lib/axios")
      const [vehicleRes, reviewsRes] = await Promise.all([
        axios.get<ApiResponse<Vehicle>>(`/vehicles/${vehicleId}`),
        axios.get<ApiResponse<Review[]>>(`/reviews/vehicle/${vehicleId}`),
      ])
      setVehicle(vehicleRes.data.data)
      setReviews(reviewsRes.data.data ?? [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [vehicleId])

  useEffect(() => {
    loadVehicle()
  }, [loadVehicle])

  const isOwnVehicle = !!(
    isAuthenticated &&
    user &&
    vehicle &&
    user.id === vehicle.vendorId
  )

  const minStart = new Date().toISOString().split("T")[0]

  const selectedDate = new Date(startDate)
  const minEnd = startDate
    ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
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

  const pricePerDay = vehicle ? parseFloat(vehicle.pricePerDay) : 0
  const totalPrice = days * pricePerDay

  const roleBlocked = !!(isAuthenticated && user && user.role !== "CUSTOMER")
  const datesInvalid = !startDate || !endDate || days <= 0
  const unavailable = !!vehicle && vehicle.status !== "AVAILABLE"

  const disabledReason = roleBlocked
    ? "Only customers can book vehicles"
    : isOwnVehicle
      ? "You can't book your own vehicle"
      : unavailable
        ? "This vehicle is not currently available"
        : datesInvalid
          ? "Select your rental dates to continue"
          : null

  const handleBook = async () => {
    if (!isAuthenticated || !user) {
      router.push(`/login?redirect=${encodeURIComponent(`/vehicles/${vehicleId}`)}`)
      return
    }
    if (user.role !== "CUSTOMER") {
      toast.error("Only customers can book vehicles")
      return
    }
    if (!startDate || !endDate) {
      toast.error("Please select your rental dates")
      return
    }
    if (days <= 0) {
      toast.error("End date must be after the start date")
      return
    }

    setSubmitting(true)
    try {
      const { default: axios } = await import("@/lib/axios")
      // Booking + Stripe Checkout session are created together: the booking is
      // recorded immediately as UNPAID/PENDING and the customer is redirected
      // straight to the Stripe payment page in the same request.
      const checkoutRes = await axios.post<ApiResponse<{ url: string }>>(
        "/payments/create-checkout-session",
        { vehicleId, startDate, endDate }
      )

      const url = checkoutRes.data.data.url
      if (url) {
        window.location.href = url
        return
      }

      toast.success("Booking created")
      router.push("/dashboard/customer")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleWishlist = async () => {
    if (!isAuthenticated || !user) {
      router.push(`/login?redirect=${encodeURIComponent(`/vehicles/${vehicleId}`)}`)
      return
    }
    if (user.role !== "CUSTOMER") {
      toast.error("Only customers can use the wishlist")
      return
    }
    try {
      const { default: axios } = await import("@/lib/axios")
      if (wishlisted) {
        const res = await axios.get<ApiResponse<Wishlist[]>>(
          "/wishlist/my-wishlist",
          { params: { limit: 100 } }
        )
        const item = res.data.data?.find((w) => w.vehicleId === vehicleId)
        if (item) {
          await axios.delete(`/wishlist/${item.id}`)
          setWishlisted(false)
          toast.success("Removed from wishlist")
        }
      } else {
        await axios.post("/wishlist", { vehicleId })
        setWishlisted(true)
        toast.success("Added to wishlist")
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return <PageLoader label="Loading vehicle..." />
  if (error || !vehicle) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="Vehicle not found"
          description={error ?? "This vehicle may have been removed."}
          action={
            <Button variant="outline" render={<Link href="/vehicles" />}>
              Browse vehicles
            </Button>
          }
        />
      </div>
    )
  }

  const images = vehicle.images.length > 0 ? vehicle.images : [null]
  const averageRating = vehicle.averageRating ?? 0
  const reviewCount = reviews.length

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-10">
          <section className="space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
              {images[activeImage] ? (
                <Image
                  src={images[activeImage]!}
                  alt={vehicle.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl">
                  🚗
                </div>
              )}
            </div>
            {images.length > 1 ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      "relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg border bg-muted",
                      index === activeImage
                        ? "ring-2 ring-ring"
                        : "opacity-70 hover:opacity-100"
                    )}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section>
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="secondary"
                className={cn("border-transparent", STATUS_STYLES[vehicle.status])}
              >
                {vehicle.status}
              </Badge>
              {vehicle.category ? (
                <Badge variant="outline">{vehicle.category.name}</Badge>
              ) : null}
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">
                  {averageRating.toFixed(1)}
                </span>
                ({reviewCount} reviews)
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              {vehicle.name}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {vehicle.brand} · {vehicle.model}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="size-4" />
                {vehicle.location ?? "On request"}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="size-4" />
                Added {new Date(vehicle.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-5 text-3xl font-bold">
              ${pricePerDay.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">
                /day
              </span>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">About this vehicle</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {vehicle.description}
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <ShieldCheck className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Insured & inspected</p>
                <p className="text-xs text-muted-foreground">
                  Every vehicle passes a quality check before listing.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Truck className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Flexible pickup</p>
                <p className="text-xs text-muted-foreground">
                  Coordinate pickup directly with the vendor.
                </p>
              </div>
            </div>
          </section>

          <section>
            <Card>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Avatar className="size-12">
                  {vehicle.vendor?.profileImage ? (
                    <AvatarImage
                      src={vehicle.vendor.profileImage}
                      alt={vehicle.vendor?.name ?? "Vendor"}
                    />
                  ) : null}
                  <AvatarFallback>
                    {(vehicle.vendor?.name ?? "V").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="flex items-center gap-1.5 text-sm">
                    {vehicle.vendor?.name ?? "Vehicle vendor"}
                    <BadgeCheck className="size-4 text-primary" />
                  </CardTitle>
                  <CardDescription>Verified fleet partner</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {vehicle.location
                  ? `${vehicle.location} · Serving local pickups`
                  : "Available for pickup across our partner locations."}
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-bold">Reviews</h2>
            {reviews.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No reviews yet. Be the first to share your experience.
              </p>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="lg:overflow-visible">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Book this vehicle</span>
                <span className="text-lg font-bold">
                  ${pricePerDay.toFixed(2)}
                  <span className="text-xs font-normal text-muted-foreground">
                    /day
                  </span>
                </span>
              </CardTitle>
              <CardDescription>
                Pick your dates and continue to secure payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    min={minStart}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    min={minEnd}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <div className="flex justify-between">
                  <span>
                    ${pricePerDay.toFixed(2)} × {days} day{days === 1 ? "" : "s"}
                  </span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <BookingTooltip reason={disabledReason}>
                <Button
                  className="w-full"
                  onClick={handleBook}
                  disabled={submitting || Boolean(disabledReason)}
                >
                  {submitting ? "Processing..." : "Book Now"}
                </Button>
              </BookingTooltip>

              {isAuthenticated && user?.role === "CUSTOMER" ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleWishlist}
                >
                  <Heart
                    className={cn(wishlisted && "fill-red-500 text-red-500")}
                  />
                  {wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                </Button>
              ) : null}

              {unavailable ? (
                <p className="text-center text-xs text-muted-foreground">
                  This vehicle is currently {vehicle.status.toLowerCase()}.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <Avatar>
          {review.user?.profileImage ? (
            <AvatarImage src={review.user.profileImage} alt={review.user.name} />
          ) : null}
          <AvatarFallback>
            <UserIcon className="size-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-sm">
            {review.user?.name ?? "Anonymous"}
          </CardTitle>
          <CardDescription>
            {new Date(review.createdAt).toLocaleDateString()}
          </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "size-4",
                i < review.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted"
              )}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {review.comment ?? "No comment."}
        </p>
      </CardContent>
    </Card>
  )
}

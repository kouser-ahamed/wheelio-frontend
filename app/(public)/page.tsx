"use client"

import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck,
  Car,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  Search,
  Shield,
  Star,
  Store,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { VehicleCard } from "@/components/shared/VehicleCard"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage } from "@/lib/axios"
import type { ApiResponse, Category, Vehicle } from "@/types"

function CategorySkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-6 space-y-3 bg-card">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

function VehicleSkeletonGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="aspect-[16/10] w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
          </div>
          <div className="p-4 pt-0 flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 flex-1 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const { default: axios } = await import("@/lib/axios")
        const [categoriesRes, vehiclesRes] = await Promise.all([
          axios.get<ApiResponse<Category[]>>("/categories", {
            params: { limit: 6 },
          }),
          axios.get<ApiResponse<Vehicle[]>>("/vehicles", {
            params: { limit: 6, status: "AVAILABLE", sort: "newest" },
          }),
        ])
        if (!active) return
        setCategories(categoriesRes.data.data ?? [])
        setVehicles(vehiclesRes.data.data ?? [])
      } catch (err) {
        if (active) setError(getErrorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex flex-col space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <Star className="size-3.5 fill-primary" />
              <span>#1 Vehicle Rental Platform</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              Rent the Right Vehicle, <br className="hidden sm:inline" />
              <span className="text-primary">Right When You Need It</span>
            </h1>

            <p className="mt-6 text-base text-muted-foreground sm:text-lg lg:text-xl">
              Browse a curated fleet of cars, SUVs, and luxury rides from verified local vendors.
              Transparent pricing, instant booking, and ready to drive.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto text-base font-semibold shadow-md" render={<Link href="/vehicles" />}>
                <Search className="size-5 mr-2" />
                Browse Vehicles
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base font-semibold" render={<Link href="/register" />}>
                <Store className="size-5 mr-2" />
                Become a Vendor
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>

            {/* Quick Stats Bar */}
            <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur sm:grid-cols-4">
              <div className="p-2">
                <p className="text-2xl font-bold text-foreground">5,000+</p>
                <p className="text-xs text-muted-foreground">Happy Trips</p>
              </div>
              <div className="p-2 border-l border-border/50">
                <p className="text-2xl font-bold text-foreground">200+</p>
                <p className="text-xs text-muted-foreground">Verified Vehicles</p>
              </div>
              <div className="p-2 border-l border-t border-border/50 max-sm:border-l-0 sm:border-t-0">
                <p className="text-2xl font-bold text-foreground">4.9 ★</p>
                <p className="text-xs text-muted-foreground">Customer Rating</p>
              </div>
              <div className="p-2 border-l border-t border-border/50 sm:border-t-0">
                <p className="text-2xl font-bold text-foreground">24/7</p>
                <p className="text-xs text-muted-foreground">Support Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Categories</span>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Browse by Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Find the perfect vehicle type tailored to your journey.
            </p>
          </div>
          <Button variant="ghost" size="sm" render={<Link href="/vehicles" />} className="shrink-0 text-primary">
            View All Categories
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>

        {loading ? (
          <CategorySkeletonGrid />
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Categories coming soon.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/vehicles?categoryId=${category.id}`}>
                <Card className="group transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
                  <CardHeader className="p-5 pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-xl text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        {category.icon ?? "🚗"}
                      </span>
                      <span className="font-semibold">{category.name}</span>
                    </CardTitle>
                    {category.description ? (
                      <CardDescription className="line-clamp-2 text-xs">
                        {category.description}
                      </CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0 text-xs font-medium text-primary flex items-center justify-between">
                    <span>{category._count?.vehicles ?? 0} vehicles available</span>
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Popular Vehicles Section */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Featured Fleet</span>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Popular Vehicles</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hand-picked, high-rated vehicles ready for immediate rental.
            </p>
          </div>
          <Button variant="ghost" size="sm" render={<Link href="/vehicles" />} className="shrink-0 text-primary">
            View All Fleet
            <ArrowRight className="size-4 ml-1" />
          </Button>
        </div>

        {loading ? (
          <VehicleSkeletonGrid />
        ) : error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </p>
        ) : vehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No vehicles available right now.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Simple Process</span>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How Wheelio Works</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Renting a vehicle is simple, transparent, and hassle-free.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="relative rounded-2xl border bg-card p-6 shadow-sm text-center space-y-3">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Search className="size-7" />
              </div>
              <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                Step 1
              </span>
              <h3 className="text-lg font-bold">1. Browse & Select</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Filter by category, daily rate, or location to find the perfect ride for your trip.
              </p>
            </div>

            <div className="relative rounded-2xl border bg-card p-6 shadow-sm text-center space-y-3">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CalendarCheck className="size-7" />
              </div>
              <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                Step 2
              </span>
              <h3 className="text-lg font-bold">2. Book & Pay</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select your rental dates and complete secure online checkout in seconds.
              </p>
            </div>

            <div className="relative rounded-2xl border bg-card p-6 shadow-sm text-center space-y-3">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <KeyRound className="size-7" />
              </div>
              <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                Step 3
              </span>
              <h3 className="text-lg font-bold">3. Pickup & Drive</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Meet the vendor, pick up the keys, and enjoy your journey with total peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Testimonials</span>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Loved by Drivers & Renters</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Here is what our community says about their rental experience with Wheelio.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              &ldquo;Renting a SUV for our weekend getaway was effortless. The car was clean, brand new, and the vendor pickup process took less than 5 minutes!&rdquo;
            </p>
            <div className="flex items-center gap-3 border-t pt-3">
              <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                AH
              </div>
              <div>
                <p className="text-sm font-semibold">Arif Hasan</p>
                <p className="text-xs text-muted-foreground">Customer · Dhaka</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              &ldquo;Listing my 2 cars on Wheelio turned my idle vehicles into a steady source of extra income. The vendor dashboard is super intuitive.&rdquo;
            </p>
            <div className="flex items-center gap-3 border-t pt-3">
              <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                SR
              </div>
              <div>
                <p className="text-sm font-semibold">Sabbir Rahman</p>
                <p className="text-xs text-muted-foreground">Vendor · Chittagong</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              &ldquo;Transparent pricing without surprise charges at pickup. Wheelio is hands-down the best car rental experience in Bangladesh.&rdquo;
            </p>
            <div className="flex items-center gap-3 border-t pt-3">
              <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                NK
              </div>
              <div>
                <p className="text-sm font-semibold">Nusrat Jahan</p>
                <p className="text-xs text-muted-foreground">Customer · Sylhet</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Become a Vendor CTA Banner */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground shadow-xl sm:px-12 sm:py-16">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Store className="size-3.5" />
              Partner With Us
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Got a Vehicle? Start Earning on Wheelio Today
            </h2>
            <p className="text-sm text-primary-foreground/80 sm:text-base leading-relaxed">
              List your cars, set your custom daily rates, and connect with thousands of verified drivers looking for quality rentals.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Button size="lg" variant="secondary" className="font-semibold shadow" render={<Link href="/register" />}>
                Join as Vendor
                <ArrowRight className="size-4 ml-1" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent hover:bg-primary-foreground/10 text-primary-foreground" render={<Link href="/about" />}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

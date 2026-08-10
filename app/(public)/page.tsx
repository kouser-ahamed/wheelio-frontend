"use client"

import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageLoader } from "@/components/shared/Loader"
import { VehicleCard } from "@/components/shared/VehicleCard"
import { getErrorMessage } from "@/lib/axios"
import type { ApiResponse, Category, Vehicle } from "@/types"

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
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

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex flex-col">
      <section className="bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Rent the right vehicle, right when you need it
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Browse a curated fleet of cars from trusted vendors. Simple
              booking, transparent pricing, and everything ready to drive.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/vehicles" />}>
                <Search />
                Browse vehicles
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/register" />}>
                Become a vendor
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Latest vehicles</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fresh additions to the Wheelio fleet
            </p>
          </div>
          <Button variant="link" render={<Link href="/vehicles" />} className="shrink-0">
            View all
            <ArrowRight />
          </Button>
        </div>

        {loading ? (
          <PageLoader label="Loading vehicles..." />
        ) : error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </p>
        ) : vehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No vehicles available right now. Check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Browse by category</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Find exactly what fits your trip
          </p>
        </div>

        {loading ? (
          <PageLoader label="Loading categories..." />
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Categories coming soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/vehicles?categoryId=${category.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <span className="mr-2">{category.icon ?? "🚗"}</span>
                      {category.name}
                    </CardTitle>
                    {category.description ? (
                      <CardDescription>{category.description}</CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {category._count?.vehicles ?? 0} vehicles
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

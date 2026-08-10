"use client"

import { useSearchParams } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { VehicleCard } from "@/components/shared/VehicleCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage } from "@/lib/axios"
import { cn } from "@/lib/utils"
import type { ApiResponse, Category, Vehicle } from "@/types"

const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
]

function VehicleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="h-3.5 w-24" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
    </div>
  )
}

function getPageItems(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const items: (number | "…")[] = [1]
  if (page > 3) items.push("…")
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)
  for (let i = start; i <= end; i++) items.push(i)
  if (page < totalPages - 2) items.push("…")
  items.push(totalPages)
  return items
}

interface FiltersPanelProps {
  categories: Category[]
  categoryId: string
  minPrice: string
  maxPrice: string
  sort: string
  hasFilters: boolean
  onCategoryChange: (id: string) => void
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  onSortChange: (value: string) => void
  onClear: () => void
}

function FiltersPanel({
  categories,
  categoryId,
  minPrice,
  maxPrice,
  sort,
  hasFilters,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onClear,
}: FiltersPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium">Category</h4>
        {categories.length === 0 ? (
          <p className="text-xs text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={categoryId === category.id}
                  onChange={() => onCategoryChange(category.id)}
                  className="size-4 shrink-0 accent-primary"
                />
                <span className="truncate">{category.name}</span>
                {category._count?.vehicles !== undefined ? (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {category._count.vehicles}
                  </span>
                ) : null}
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium">Price range</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            aria-label="Minimum price"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            aria-label="Maximum price"
          />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium">Sort by</h4>
        <Select value={sort} onValueChange={(value) => onSortChange(value ?? "newest")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={onClear}>
        Clear Filters
      </Button>
    </div>
  )
}

export function VehiclesClient() {
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<Category[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") ?? "all"
  )
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(1)
  const [mobileOpen, setMobileOpen] = useState(false)

  const loadCategories = useCallback(async () => {
    try {
      const { default: axios } = await import("@/lib/axios")
      const res = await axios.get<ApiResponse<Category[]>>("/categories", {
        params: { limit: 50 },
      })
      setCategories(res.data.data ?? [])
    } catch {
      setCategories([])
    }
  }, [])

  const loadVehicles = useCallback(async (targetPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const { default: axios } = await import("@/lib/axios")
      const params: Record<string, string | number> = {
        page: targetPage,
        limit: PAGE_SIZE,
        sort,
      }
      if (categoryId !== "all") params.categoryId = categoryId
      if (minPrice !== "") params.minPrice = Number(minPrice)
      if (maxPrice !== "") params.maxPrice = Number(maxPrice)

      const res = await axios.get<ApiResponse<Vehicle[]>>("/vehicles", { params })
      setVehicles(res.data.data ?? [])
      setTotal(res.data.meta?.total ?? 0)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [categoryId, minPrice, maxPrice, sort])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    const timer = setTimeout(() => loadVehicles(page), 300)
    return () => clearTimeout(timer)
  }, [loadVehicles, page])

  const handleCategoryChange = (id: string) => {
    setCategoryId((current) => (current === id ? "all" : id))
    setPage(1)
  }
  const handleMinPriceChange = (value: string) => {
    setMinPrice(value)
    setPage(1)
  }
  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value)
    setPage(1)
  }
  const handleSortChange = (value: string) => {
    setSort(value)
    setPage(1)
  }

  const resetFilters = () => {
    setCategoryId("all")
    setMinPrice("")
    setMaxPrice("")
    setSort("newest")
    setPage(1)
  }

  const hasFilters =
    categoryId !== "all" || minPrice !== "" || maxPrice !== "" || sort !== "newest"

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const filtersPanel = (
    <FiltersPanel
      categories={categories}
      categoryId={categoryId}
      minPrice={minPrice}
      maxPrice={maxPrice}
      sort={sort}
      hasFilters={hasFilters}
      onCategoryChange={handleCategoryChange}
      onMinPriceChange={handleMinPriceChange}
      onMaxPriceChange={handleMaxPriceChange}
      onSortChange={handleSortChange}
      onClear={resetFilters}
    />
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Browse vehicles"
        description={`${total} vehicle${total === 1 ? "" : "s"} available`}
        action={
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={<Button variant="outline" className="lg:hidden" />}>
              <SlidersHorizontal />
              Filters
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-80 overflow-y-auto p-0 sm:max-w-sm"
            >
              <SheetHeader className="border-b px-4 py-4 text-left">
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Narrow down the fleet to fit your trip.
                </SheetDescription>
              </SheetHeader>
              <div className="p-4">{filtersPanel}</div>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="mt-8 flex items-start gap-8">
        <aside className="sticky top-24 hidden w-64 shrink-0 lg:block">
          <div className="rounded-xl border p-5">{filtersPanel}</div>
        </aside>

        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </p>
          ) : vehicles.length === 0 ? (
            <EmptyState
              title="No vehicles found"
              description="Try adjusting your filters to see more results."
              action={
                <Button variant="outline" onClick={resetFilters}>
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <>
              <div
                className={cn(
                  "grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                )}
              >
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>

              {totalPages > 1 ? (
                <nav
                  className="mt-10 flex flex-wrap items-center justify-center gap-1"
                  aria-label="Pagination"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    aria-label="First page"
                  >
                    <ChevronsLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft />
                  </Button>
                  {getPageItems(page, totalPages).map((item, index) =>
                    item === "…" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="flex size-9 items-center justify-center text-sm text-muted-foreground"
                      >
                        …
                      </span>
                    ) : (
                      <Button
                        key={item}
                        variant={item === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => setPage(item)}
                        aria-current={item === page ? "page" : undefined}
                      >
                        {item}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    aria-label="Last page"
                  >
                    <ChevronsRight />
                  </Button>
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

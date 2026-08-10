import Image from "next/image"
import Link from "next/link"
import { MapPin, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Vehicle, VehicleStatus } from "@/types"

const STATUS_STYLES: Record<VehicleStatus, string> = {
  AVAILABLE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  BOOKED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  MAINTENANCE: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  INACTIVE: "bg-muted text-muted-foreground",
}

interface VehicleCardProps {
  vehicle: Vehicle
  className?: string
}

export function VehicleCard({ vehicle, className }: VehicleCardProps) {
  const image = vehicle.images?.[0]
  const averageRating = vehicle.averageRating ?? 0

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden transition-shadow hover:shadow-md",
        className
      )}
    >
      <CardHeader className="p-0">
        <Link
          href={`/vehicles/${vehicle.id}`}
          className="group relative block aspect-[16/10] w-full overflow-hidden bg-muted"
          aria-label={vehicle.name}
        >
          {image ? (
            <Image
              src={image}
              alt={vehicle.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">
              🚗
            </div>
          )}
          <div className="absolute left-3 top-3">
            {vehicle.category?.name ? (
              <Badge variant="secondary" className="bg-background/90">
                {vehicle.category.name}
              </Badge>
            ) : null}
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "absolute right-3 top-3 border-transparent",
              STATUS_STYLES[vehicle.status]
            )}
          >
            {vehicle.status}
          </Badge>
        </Link>
      </CardHeader>

      <CardContent className="flex-1 space-y-1 p-4">
        <Link
          href={`/vehicles/${vehicle.id}`}
          className="block font-semibold leading-tight transition-colors hover:text-primary"
        >
          {vehicle.name}
        </Link>
        <p className="text-sm text-muted-foreground">
          {vehicle.brand} · {vehicle.model}
        </p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">
              {averageRating.toFixed(1)}
            </span>
            <span>({vehicle.reviewCount ?? 0})</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {vehicle.location ?? "On request"}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3 p-4 pt-0">
        <p className="font-semibold">
          ${parseFloat(vehicle.pricePerDay).toFixed(2)}
          <span className="text-xs font-normal text-muted-foreground">
            /day
          </span>
        </p>
        <Button size="sm" render={<Link href={`/vehicles/${vehicle.id}`} />}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}

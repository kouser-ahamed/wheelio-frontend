import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type {
  BookingStatus,
  PaymentStatus,
  UserRole,
  VehicleStatus,
} from "@/types"

type Status = BookingStatus | PaymentStatus | UserRole | VehicleStatus

const STYLES: Record<string, string> = {
  AVAILABLE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  BOOKED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  MAINTENANCE: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  INACTIVE: "bg-muted text-muted-foreground",

  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  CONFIRMED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  ONGOING: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CANCELLED: "bg-muted text-muted-foreground",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400",

  UNPAID: "bg-red-500/10 text-red-600 dark:text-red-400",
  PAID: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  REFUNDED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  FAILED: "bg-muted text-muted-foreground",

  CUSTOMER: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  VENDOR: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  ADMIN: "bg-primary/10 text-primary",
}

export function StatusBadge({
  status,
  className,
}: {
  status: Status
  className?: string
}) {
  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent", STYLES[status], className)}
    >
      {status}
    </Badge>
  )
}

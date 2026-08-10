import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface LoaderProps {
  className?: string
  label?: string
}

export function Loader({ className, label }: LoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground",
        className
      )}
    >
      <Loader2 className="size-8 animate-spin text-primary" />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  )
}

export function PageLoader({
  className,
  label,
}: {
  className?: string
  label?: string
}) {
  return <Loader className={className} label={label} />
}

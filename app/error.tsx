"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-10" />
      </div>

      <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
        Something went wrong
      </span>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
        An unexpected error occurred
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        {error.message || "We encountered an issue while loading this page. Please try again."}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button onClick={() => reset()}>
          <RefreshCw className="size-4 mr-2" />
          Try Again
        </Button>
        <Button variant="outline" render={<Link href="/" />}>
          <Home className="size-4 mr-2" />
          Go to Home
        </Button>
      </div>
    </div>
  )
}

import Link from "next/link"
import { Car, Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6 flex size-24 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
        <Car className="size-12 animate-bounce" />
        <span className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground shadow">
          404
        </span>
      </div>

      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        Page Not Found
      </span>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
        Looks like you took a wrong turn
      </h1>

      <p className="mt-4 max-w-md text-base text-muted-foreground">
        The page you are looking for doesn&apos;t exist, has been removed, or is temporarily unavailable.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button render={<Link href="/" />}>
          <Home className="size-4 mr-2" />
          Back to Home
        </Button>
        <Button variant="outline" render={<Link href="/vehicles" />}>
          <Search className="size-4 mr-2" />
          Browse Vehicles
        </Button>
      </div>
    </div>
  )
}

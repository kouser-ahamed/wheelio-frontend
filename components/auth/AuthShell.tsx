import Link from "next/link"
import { Car } from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface AuthShellProps {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: AuthShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Car className="size-5" />
          </span>
          <span className="text-xl">Wheelio</span>
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <Card>
        <CardHeader />
        <CardContent>{children}</CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {footer}
      </p>
    </div>
  )
}

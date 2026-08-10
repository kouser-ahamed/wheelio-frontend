"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Car,
  ClipboardList,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
} from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { PageLoader } from "@/components/shared/Loader"
import { useAuthStore } from "@/lib/auth-store"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types"

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/vehicles", label: "Vehicles", icon: Car },
    { href: "/dashboard/admin/bookings", label: "Bookings", icon: ClipboardList },
  ],
  VENDOR: [
    { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/vendor/vehicles", label: "My Vehicles", icon: Car },
    { href: "/dashboard/vendor/bookings", label: "Bookings", icon: ClipboardList },
  ],
  CUSTOMER: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/bookings", label: "My Bookings", icon: ClipboardList },
    { href: "/dashboard/customer/wishlist", label: "Wishlist", icon: Heart },
  ],
}

function DashboardLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { user } = useAuthStore()

  if (!user) return null
  const items = NAV_BY_ROLE[user.role] ?? []

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function DashboardFooter() {
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    logout()
    const { clearAuthCookie } = await import("@/lib/cookie")
    clearAuthCookie()
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.post("/auth/logout")
    } catch {
      // ignore
    }
    toast.success("Logged out successfully")
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="border-t p-3">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={handleLogout}
      >
        <LogOut />
        Log out
      </Button>
    </div>
  )
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      )
    }
  }, [ready, isAuthenticated, router])

  if (!ready || !isAuthenticated || !user) {
    return <PageLoader label="Checking your session..." />
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-3 border-b px-4 py-4">
        <Avatar>
          {user.profileImage ? (
            <AvatarImage src={user.profileImage} alt={user.name} />
          ) : null}
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
          </p>
        </div>
      </div>
      <DashboardLinks />
      <DashboardFooter />
    </div>
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-20 overflow-hidden rounded-xl border">
          <div className="h-[calc(100vh-7rem)]">{sidebar}</div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Car className="size-4" />
            </span>
            <span className="text-sm">Wheelio</span>
          </Link>
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="icon" />}>
              <Menu />
              <span className="sr-only">Open dashboard menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="border-b px-4 py-4 text-left">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100vh-4rem)]">
                <DashboardLinks onNavigate={() => {}} />
                <DashboardFooter />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="space-y-8">{children}</div>
      </div>
    </div>
  )
}

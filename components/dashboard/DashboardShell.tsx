"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Car,
  ClipboardList,
  FolderKanban,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Star,
  User as UserIcon,
  Users,
} from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
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
    { href: "/dashboard/admin/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/categories", label: "Categories", icon: FolderKanban },
    { href: "/dashboard/admin/vehicles", label: "Vehicles", icon: Car },
    { href: "/dashboard/admin/bookings", label: "Bookings", icon: ClipboardList },
    { href: "/dashboard/admin/reviews", label: "Reviews", icon: Star },
    { href: "/dashboard/admin/profile", label: "Profile", icon: UserIcon },
  ],
  VENDOR: [
    { href: "/dashboard/vendor/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/vendor/vehicles", label: "My Vehicles", icon: Car },
    { href: "/dashboard/vendor/bookings", label: "Booking Requests", icon: ClipboardList },
    { href: "/dashboard/vendor/reviews", label: "Reviews", icon: Star },
    { href: "/dashboard/vendor/profile", label: "Profile", icon: UserIcon },
  ],
  CUSTOMER: [
    { href: "/dashboard/customer/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/bookings", label: "My Bookings", icon: ClipboardList },
    { href: "/dashboard/customer/wishlist", label: "Wishlist", icon: Heart },
    { href: "/dashboard/customer/profile", label: "Profile", icon: UserIcon },
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
          pathname === item.href ||
          (pathname === `/dashboard/${user.role.toLowerCase()}` && item.href.endsWith("/overview")) ||
          (item.href !== `/dashboard/${user.role.toLowerCase()}/overview` && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span>{item.label}</span>
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
        className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="size-4 mr-2" />
        Log out
      </Button>
    </div>
  )
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)

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
    <div className="flex h-full flex-col justify-between py-2">
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Avatar className="size-10 border">
            {user.profileImage ? (
              <AvatarImage src={user.profileImage} alt={user.name} />
            ) : null}
            <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">
              {user.role.toLowerCase()}
            </p>
          </div>
        </div>
        <DashboardLinks onNavigate={() => setOpen(false)} />
      </div>
      <DashboardFooter />
    </div>
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-20 overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="h-[calc(100vh-7rem)]">{sidebar}</div>
        </div>
      </aside>

      {/* Content area & Mobile Sheet Header */}
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between lg:hidden rounded-lg border bg-card p-3 shadow-sm">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Car className="size-4" />
            </span>
            <span className="text-base font-bold">Wheelio</span>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <button
                  type="button"
                  className={buttonVariants({ variant: "outline", size: "icon" })}
                />
              }
            >
              <Menu className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b px-4 py-4 text-left">
                <SheetTitle className="flex items-center gap-2">
                  <Car className="size-5 text-primary" />
                  Dashboard Menu
                </SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100vh-4rem)]">{sidebar}</div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="space-y-8">{children}</div>
      </div>
    </div>
  )
}

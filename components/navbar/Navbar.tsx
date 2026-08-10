"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Car,
  LayoutDashboard,
  LogOut,
  Menu,
  User as UserIcon,
  UserRound,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useAuthStore } from "@/lib/auth-store"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const ROLE_DASHBOARD: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  VENDOR: "/dashboard/vendor",
  CUSTOMER: "/dashboard/customer",
}

const ROLE_PROFILE: Record<string, string> = {
  ADMIN: "/dashboard/admin/profile",
  VENDOR: "/dashboard/vendor/profile",
  CUSTOMER: "/dashboard/customer/profile",
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDashboardClick = () => {
    if (user) {
      router.push(ROLE_DASHBOARD[user.role] ?? "/dashboard")
    } else {
      router.push("/login")
    }
  }

  const handleProfileClick = () => {
    if (user) {
      router.push(ROLE_PROFILE[user.role] ?? "/dashboard")
    } else {
      router.push("/login")
    }
  }

  const handleLogout = async () => {
    logout()
    const { clearAuthCookie } = await import("@/lib/cookie")
    clearAuthCookie()
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.post("/auth/logout")
    } catch {
      // backend already clears its session; safe to ignore
    }
    toast.success("Logged out successfully")
    router.push("/")
    router.refresh()
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu />
          </Button>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Car className="size-4" />
            </span>
            <span className="text-lg">Wheelio</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Account menu"
                  />
                }
              >
                <Avatar className="size-9">
                  {user.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={user.name} />
                  ) : null}
                  <AvatarFallback>
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-32 truncate text-sm font-medium sm:block">
                  {user.name}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <span className="truncate">
                    {user.name}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDashboardClick}>
                  <LayoutDashboard />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleProfileClick}>
                  <UserRound />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/login" />}
              >
                <UserIcon />
                Login
              </Button>
              <Button size="sm" render={<Link href="/register" />}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-72 flex-col gap-0 p-0 sm:max-w-sm"
        >
          <SheetHeader className="border-b px-4 py-4 text-left">
            <SheetTitle className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Car className="size-4" />
              </span>
              Wheelio
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-2 border-t p-4">
            {isAuthenticated && user ? (
              <>
                <div className="mb-2 flex items-center gap-3">
                  <Avatar>
                    {user.profileImage ? (
                      <AvatarImage src={user.profileImage} alt={user.name} />
                    ) : null}
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileOpen(false)
                    handleDashboardClick()
                  }}
                >
                  <LayoutDashboard />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileOpen(false)
                    handleProfileClick()
                  }}
                >
                  <UserRound />
                  My Profile
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setMobileOpen(false)
                    handleLogout()
                  }}
                >
                  <LogOut />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link href="/login" onClick={() => setMobileOpen(false)} />
                  }
                >
                  <UserIcon />
                  Login
                </Button>
                <Button
                  size="sm"
                  render={
                    <Link href="/register" onClick={() => setMobileOpen(false)} />
                  }
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

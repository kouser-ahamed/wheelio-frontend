import Link from "next/link"
import { AtSign, Car, Globe, Mail, MapPin, Phone, Share2 } from "lucide-react"

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const SOCIAL_LINKS = [
  { icon: Globe, label: "Website" },
  { icon: AtSign, label: "Social" },
  { icon: Share2, label: "Share" },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Car className="size-4" />
            </span>
            <span className="text-lg">Wheelio</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Rent the perfect vehicle for any journey. Simple booking, trusted
            vendors, and wheels that move with you.
          </p>
          <div className="flex items-center gap-2 pt-2">
            {SOCIAL_LINKS.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={`${label} (coming soon)`}
                className="flex size-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Quick Links</h3>
          <ul className="space-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Get Started</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/register"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Create an account
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
            </li>
            <li>
              <Link
                href="/vehicles"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Browse vehicles
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Contact</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="size-4" />
              support@wheelio.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4" />
              +1 (555) 000-0000
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              Dhaka, Bangladesh
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Wheelio. All rights reserved.</p>
          <p>Rent smart. Drive happy.</p>
        </div>
      </div>
    </footer>
  )
}

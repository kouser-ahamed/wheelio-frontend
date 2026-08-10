import type { Metadata } from "next"
import Link from "next/link"
import {
  Award,
  Car,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Wheelio and how we make vehicle rentals simple, secure, and transparent.",
}

const FEATURES = [
  {
    icon: Car,
    title: "Curated Vehicle Fleet",
    description:
      "Every car listed on Wheelio goes through vendor verification and inspection before listing.",
  },
  {
    icon: Wallet,
    title: "100% Upfront Pricing",
    description:
      "Daily rental rates are upfront with zero hidden fees. What you see is what you pay.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Booking & Payments",
    description:
      "All rental bookings and card payments are encrypted and processed securely.",
  },
  {
    icon: Clock,
    title: "Instant Confirmation",
    description:
      "Book your dates online in minutes without tedious phone calls or manual paperwork.",
  },
]

const STATS = [
  { label: "Successful Rentals", value: "10,000+" },
  { label: "Listed Vehicles", value: "500+" },
  { label: "Verified Vendors", value: "120+" },
  { label: "Satisfaction Rate", value: "99%" },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Section */}
      <div className="mx-auto max-w-3xl text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" />
          About Wheelio
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Making Vehicle Rentals Simple, Secure & Transparent
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Wheelio is a modern vehicle rental marketplace connecting drivers who need a reliable ride with trusted local vendors who own quality vehicles.
        </p>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center p-2">
            <p className="text-3xl font-extrabold text-primary sm:text-4xl">{stat.value}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Why Choose Us Features Grid */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why Choose Wheelio?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We built Wheelio to remove the friction and hassle traditional car rental services present.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="p-2 transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Our Mission Story */}
      <div className="rounded-3xl border bg-card p-8 sm:p-12 shadow-sm space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <Award className="size-5" />
          <span>OUR MISSION</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Democratizing Car Rental across Bangladesh
        </h2>
        <p className="leading-relaxed text-muted-foreground text-sm sm:text-base">
          We started Wheelio because renting a vehicle should be as easy and seamless as booking a hotel room online. Whether you need a sedan for a weekend road trip, an SUV for family travel, or a luxury ride for a wedding, Wheelio connects you directly with verified hosts.
        </p>
        <div className="pt-4 flex flex-wrap gap-4">
          <Button render={<Link href="/vehicles" />}>Explore Our Fleet</Button>
          <Button variant="outline" render={<Link href="/contact" />}>Get in Touch</Button>
        </div>
      </div>
    </div>
  )
}

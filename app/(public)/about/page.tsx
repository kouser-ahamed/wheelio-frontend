import type { Metadata } from "next"
import { ShieldCheck, Sparkles, Truck, Wallet } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Wheelio and how we make vehicle rental simple.",
}

const FEATURES = [
  {
    icon: Truck,
    title: "Curated fleet",
    description:
      "Every vehicle is listed by a verified vendor and checked before going live.",
  },
  {
    icon: Wallet,
    title: "Transparent pricing",
    description:
      "Daily rates are upfront with no hidden fees. What you see is what you pay.",
  },
  {
    icon: ShieldCheck,
    title: "Secure booking",
    description:
      "Payments are processed securely and bookings are confirmed instantly.",
  },
  {
    icon: Sparkles,
    title: "Simple experience",
    description:
      "From search to keys in hand, we keep the process fast and frictionless.",
  },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">About Wheelio</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Wheelio is a vehicle rental marketplace that connects people who need
          a ride with trusted vendors who have the right vehicle for it.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-14 rounded-2xl bg-muted/40 p-8 sm:p-12">
        <h2 className="text-2xl font-bold tracking-tight">Our story</h2>
        <p className="mt-4 leading-7 text-muted-foreground">
          We started Wheelio because renting a vehicle should feel as easy as
          booking a hotel room. Our platform brings vendors and renters
          together with clear pricing, honest availability, and a booking flow
          that takes minutes — not phone calls and paperwork.
        </p>
      </div>
    </div>
  )
}

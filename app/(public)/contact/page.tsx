import type { Metadata } from "next"
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Wheelio team.",
}

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: "Email",
    value: "support@wheelio.com",
    hint: "We reply within 24 hours",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+1 (555) 000-0000",
    hint: "Mon–Fri, 9am–6pm",
  },
  {
    icon: MapPin,
    title: "Office",
    value: "Dhaka, Bangladesh",
    hint: "Visit us by appointment",
  },
]

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Contact us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Have a question about a vehicle, your booking, or becoming a vendor?
          We&apos;re here to help.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {CONTACT_METHODS.map((method) => (
          <Card key={method.title}>
            <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <method.icon className="size-5" />
              </div>
              <p className="mt-1 text-sm font-semibold">{method.title}</p>
              <p className="text-sm text-muted-foreground">{method.value}</p>
              <p className="text-xs text-muted-foreground">{method.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border p-8 sm:p-10">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 text-primary" />
          <h2 className="text-xl font-bold">Send us a message</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Send an email to support@wheelio.com with your question, or reach out
          through the contact channel above. We&apos;ll get back to you as soon
          as possible.
        </p>
      </div>
    </div>
  )
}

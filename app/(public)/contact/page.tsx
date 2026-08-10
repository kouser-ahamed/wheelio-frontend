"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Clock, Loader2, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type ContactFormValues = z.infer<typeof contactSchema>

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: "Email Us",
    value: "support@wheelio.com",
    hint: "We reply within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    value: "+880 1700-000000",
    hint: "Mon–Fri, 9am–6pm",
  },
  {
    icon: MapPin,
    title: "Our Office",
    value: "Gulshan 2, Dhaka, Bangladesh",
    hint: "Visit us by appointment",
  },
  {
    icon: Clock,
    title: "Support Hours",
    value: "24/7 Assistance",
    hint: "Customer support always online",
  },
]

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitting(true)
    // Simulate sending message
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSubmitting(false)
    toast.success("Message sent successfully!")
    form.reset()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <MessageSquare className="size-3.5" />
          Get In Touch
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Contact Us</h1>
        <p className="text-base text-muted-foreground">
          Have questions about booking a vehicle, listing your fleet, or partnership opportunities? We&apos;re here to help!
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CONTACT_METHODS.map((method) => (
          <Card key={method.title} className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <method.icon className="size-6" />
              </div>
              <p className="mt-2 text-base font-bold text-foreground">{method.title}</p>
              <p className="text-sm font-medium text-primary">{method.value}</p>
              <p className="text-xs text-muted-foreground">{method.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Form & Side Banner */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Interactive Form */}
        <div className="rounded-3xl border bg-card p-6 sm:p-10 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Send Us a Message</h2>
            <p className="text-xs text-muted-foreground mt-1">Fill out the form below and our support team will get back to you shortly.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Rental Inquiry / Vendor Question" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us how we can help you..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg" className="w-full sm:w-auto font-semibold" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <Send className="size-4 mr-2" />
                )}
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Side Info Panel */}
        <div className="space-y-6 rounded-3xl bg-primary p-6 sm:p-8 text-primary-foreground shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <span className="inline-block rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold">
              Frequently Asked Questions
            </span>
            <h3 className="text-2xl font-bold">Need Immediate Help?</h3>
            <p className="text-xs text-primary-foreground/80 leading-relaxed">
              Check out our Help Center or browse popular vehicles directly to get started. For urgent rental changes or vendor support, email us directly.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-primary-foreground/20">
            <p className="text-xs font-semibold">Office Hours:</p>
            <p className="text-xs text-primary-foreground/80">Monday – Friday: 9:00 AM – 6:00 PM</p>
            <p className="text-xs text-primary-foreground/80">Saturday – Sunday: 10:00 AM – 4:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  )
}

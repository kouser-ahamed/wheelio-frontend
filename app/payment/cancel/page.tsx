import type { Metadata } from "next"
import { Suspense } from "react"

import { PaymentCancelClient } from "@/components/payment/PaymentCancelClient"

export const metadata: Metadata = {
  title: "Payment Cancelled",
}

export default function PaymentCancelPage() {
  return (
    <Suspense>
      <PaymentCancelClient />
    </Suspense>
  )
}

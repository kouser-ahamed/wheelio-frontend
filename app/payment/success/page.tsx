import type { Metadata } from "next"
import { Suspense } from "react"

import { PaymentSuccessClient } from "@/components/payment/PaymentSuccessClient"

export const metadata: Metadata = {
  title: "Payment Successful",
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessClient />
    </Suspense>
  )
}

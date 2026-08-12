"use client"

import { useAuthStore } from "@/lib/auth-store"
import { ChangePasswordForm } from "./ChangePasswordForm"
import { SetPasswordForm } from "./SetPasswordForm"

export function ProfileSecuritySection() {
  const { user } = useAuthStore()

  if (user?.hasPassword === false) {
    return <SetPasswordForm />
  }

  return <ChangePasswordForm />
}

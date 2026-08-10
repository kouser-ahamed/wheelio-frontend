"use client"

import { GoogleLogin } from "@react-oauth/google"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import type { User } from "@/types"

const ROLE_DASHBOARD: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  VENDOR: "/dashboard/vendor",
  CUSTOMER: "/dashboard/customer",
}

interface GoogleCredentialResponse {
  credential?: string
}

function isSafeRedirect(redirect: string | null): boolean {
  return Boolean(
    redirect &&
      !redirect.startsWith("/login") &&
      !redirect.startsWith("/register") &&
      !redirect.startsWith("//")
  )
}

export function GoogleLoginButton() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSuccess = async (
    credentialResponse: GoogleCredentialResponse
  ) => {
    const credential = credentialResponse.credential
    if (!credential) {
      toast.error("Google sign-in failed. Please try again.")
      return
    }

    try {
      const { default: axios } = await import("@/lib/axios")
      const { useAuthStore } = await import("@/lib/auth-store")
      const { setAuthCookie } = await import("@/lib/cookie")

      const res = await axios.post<{
        data: { user: User; token: string }
      }>("/auth/google-login", { credential })

      const { user, token } = res.data.data
      useAuthStore.getState().setAuth(user, token)
      setAuthCookie(token)

      toast.success("Logged in successfully")

      const redirect = searchParams.get("redirect")
      if (isSafeRedirect(redirect)) {
        router.push(redirect!)
      } else {
        router.push(ROLE_DASHBOARD[user.role] ?? "/")
      }
      router.refresh()
    } catch (error) {
      const { getErrorMessage } = await import("@/lib/axios")
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => toast.error("Google sign-in failed. Please try again.")}
      shape="rectangular"
      theme="outline"
      size="large"
      text="continue_with"
      width="100%"
    />
  )
}

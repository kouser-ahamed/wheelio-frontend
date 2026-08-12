"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
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

interface GsiId {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
  }) => void
  renderButton: (element: HTMLElement, options: {
    type?: string
    theme?: string
    size?: string
    text?: string
    shape?: string
    width?: number
  }) => void
}

interface WindowWithGoogle {
  google?: { accounts?: { id?: GsiId } }
}

// Module-level guard so `google.accounts.id.initialize()` only runs once for the
// lifetime of this browser tab. @react-oauth/google's <GoogleLogin> calls
// initialize() on EVERY mount, so navigating back to the login page via
// client-side routing re-initializes GSI and fires the
// "[GSI_LOGGER]: initialize() is called multiple times" warning. Raw GSI +
// this guard keeps initialization at exactly once per session, including after
// client-side navigation and React StrictMode double-invocation in dev.
let gsiInitialized = false

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
  const buttonRef = useRef<HTMLDivElement>(null)
  const [buttonWidth, setButtonWidth] = useState<number | null>(null)

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

  useEffect(() => {
    const el = buttonRef.current
    if (!el) return

    const updateWidth = () => {
      if (el.clientWidth > 0) {
        setButtonWidth(el.clientWidth)
      }
    }

    updateWidth()

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateWidth)
      observer.observe(el)
      return () => observer.disconnect()
    }
    return undefined
  }, [])

  useEffect(() => {
    // IMPORTANT: The Client ID's "Authorized JavaScript origins" in Google Cloud
    // Console must include both http://localhost:3000 and the production frontend
    // domain. If you see "origin not allowed" / 403 errors, verify this in Google
    // Cloud Console - this cannot be fixed in code.
    let disposed = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const renderButton = () => {
      const gsi = (window as WindowWithGoogle).google?.accounts?.id
      const el = buttonRef.current
      if (disposed || !gsi || !el || buttonWidth === null) return false

      if (!gsiInitialized) {
        gsiInitialized = true
        gsi.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
          callback: (response) => {
            const credential = response.credential
            if (!credential) {
              toast.error("Google sign-in failed. Please try again.")
              return
            }
            void handleSuccess({ credential })
          },
        })
      }

      gsi.renderButton(el, {
        type: "standard",
        shape: "rectangular",
        theme: "outline",
        size: "large",
        text: "continue_with",
        width: buttonWidth,
      })
      return true
    }

    if (!renderButton()) {
      // GSI script is loaded by <GoogleOAuthProvider> in the root layout; retry
      // until it is available (and the container width is measured).
      timer = setInterval(() => {
        if (renderButton()) {
          clearInterval(timer)
        }
      }, 100)
    }

    return () => {
      disposed = true
      if (timer) clearInterval(timer)
    }
  }, [buttonWidth])

  return (
    <div
      ref={buttonRef}
      className="w-full"
      style={{ minHeight: 40 }}
    />
  )
}
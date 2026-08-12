"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"
import type { ReactNode } from "react"

// Google Identity Services (GSI) configuration.
//
// This provider is deliberately mounted ONCE here at the root layout so the GSI
// script (`https://accounts.google.com/gsi/client`) is loaded exactly once for
// the lifetime of the app instead of once per page visit. Do not wrap additional
// parts of the tree in <GoogleOAuthProvider>. Note: this provider only loads the
// script — it does NOT call `google.accounts.id.initialize()`. Initialization is
// handled once-per-session inside GoogleLoginButton (guarded by a module-level
// flag) so it never repeats on client-side navigation or StrictMode re-renders.
//
// EXTERNAL CONFIG REQUIRED (not fixable in code): the OAuth Client ID below must
// list the exact origin being tested in Google Cloud Console under
// "Authorized JavaScript origins" — including http://localhost:3000 and the
// production frontend URL. Otherwise GSI requests fail with a 403 and
// "[GSI_LOGGER]: The given origin is not allowed for the given client ID."
export function GoogleProvider({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
    >
      {children}
    </GoogleOAuthProvider>
  )
}

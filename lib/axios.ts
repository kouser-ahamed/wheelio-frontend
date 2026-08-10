import axios from "axios"

import { clearAuthCookie } from "@/lib/cookie"

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("wheelio-auth")
      if (raw) {
        const { state } = JSON.parse(raw)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      }
    } catch {
      // ignore malformed persisted state
    }
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status

    if (status === 401 && typeof window !== "undefined") {
      try {
        const { useAuthStore } = await import("@/lib/auth-store")
        useAuthStore.getState().logout()
      } catch {
        localStorage.removeItem("wheelio-auth")
      }
      clearAuthCookie()

      const redirect = encodeURIComponent(
        `${window.location.pathname}${window.location.search}`
      )
      if (window.location.pathname !== "/login") {
        // This runs inside an axios interceptor, outside React, so
        // redirect()/useRouter() are not available here.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(
          `${window.location.origin}/login?redirect=${redirect}`
        )
      }
    }

    return Promise.reject(error)
  }
)

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const message = error.response?.data?.message
    if (message) return message
    if (error.code === "ERR_NETWORK") {
      return "Unable to reach the server. Please try again."
    }
  }
  if (error instanceof Error && error.message) return error.message
  return "Something went wrong. Please try again."
}

export default axiosInstance

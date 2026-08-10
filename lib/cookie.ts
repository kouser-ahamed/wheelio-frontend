export const AUTH_COOKIE_NAME = "wheelio-token"

export function setAuthCookie(token: string): void {
  if (typeof document === "undefined") return
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
    token
  )}; path=/; max-age=604800; SameSite=Lax`
}

export function clearAuthCookie(): void {
  if (typeof document === "undefined") return
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`
}

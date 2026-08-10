import { NextResponse, type NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("wheelio-token")?.value

  if (!token) {
    const redirectPath = `${pathname}${search}`
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", redirectPath)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/dashboard/:path*",
}

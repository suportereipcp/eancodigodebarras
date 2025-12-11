import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth-token")?.value
  const isLoginPage = request.nextUrl.pathname === "/login"
  const isApiRoute = request.nextUrl.pathname.startsWith("/api")

  // Allow API routes to handle their own authentication
  if (isApiRoute) {
    return NextResponse.next()
  }

  // If user is authenticated and trying to access login page, redirect to home
  if (authToken && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If user is not authenticated and not on login page, redirect to login
  if (!authToken && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

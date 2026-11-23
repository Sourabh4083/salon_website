import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// This runs on the edge and cannot reach the database, so it only does a fast
// first check of the signed cookie. The pages and API routes re-check the
// account in the database (lib/auth.js getCurrentUser), which is what catches
// signed-out devices and removed admin roles.
const protectedRoutes = ["/checkout", "/profile", "/orders", "/my-orders", "/change-password"]
const adminRoutes = ["/admin"]

async function verify(token) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    return payload
  } catch {
    return null
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const payload = await verify(request.cookies.get("token")?.value)

  if (!payload) {
    return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url))
  }

  // Signed in with a temporary password from an admin reset: nothing else
  // until a new password is chosen.
  if (payload.mcp && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", request.url))
  }

  if (adminRoutes.some(route => pathname.startsWith(route)) && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/checkout",
    "/profile",
    "/orders",
    "/orders/:path*",
    "/admin",
    "/admin/:path*",
    "/my-orders",
    "/change-password",
  ],
};

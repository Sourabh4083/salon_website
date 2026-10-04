
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/checkout", "/profile", "/orders", "/my-orders"]
const adminRoutes = ["/admin"]
// Pages that only make sense when signed out.
const guestOnlyRoutes = ["/login", "/register"]

// Only same-site paths are honoured, so ?redirect=https://evil.com is ignored.
function safeRedirect(value) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/"
}

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

  const { pathname, searchParams } = request.nextUrl
  const token = request.cookies.get("token")?.value;

  // Signed-in users have no business on login/register: send them on to
  // wherever they were headed, or home.
  if (guestOnlyRoutes.some(route => pathname.startsWith(route))) {
    const payload = await verify(token)
    if (payload) {
      return NextResponse.redirect(new URL(safeRedirect(searchParams.get("redirect")), request.url))
    }
    return NextResponse.next()
  }

  if (![...protectedRoutes, ...adminRoutes].some(route => pathname.startsWith(route))) {
    return NextResponse.next()
    
  }


  if (!token) {
    
    const loginUrl = new URL(`/login?redirect=${pathname}`, request.url)
    return NextResponse.redirect(loginUrl)
    
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))

    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }
    return NextResponse.next();
  } catch (err) {
    const loginUrl = new URL(`/login?redirect=${pathname}`, request.url)
    return NextResponse.redirect(loginUrl)
    
  }
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
    "/login",
    "/register",
  ],
};

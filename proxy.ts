import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login"];

// Routes that should be accessible without authentication (auth API, static files)
const isPublicPath = (pathname: string): boolean => {
  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  // Allow auth API routes
  if (pathname.startsWith("/api/auth")) {
    return true;
  }

  // Allow API routes for webhooks, etc.
  if (pathname.startsWith("/api/")) {
    return true;
  }

  return false;
};

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without authentication check
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // If not authenticated, redirect to login
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated - allow access
    return NextResponse.next();
  } catch (error) {
    // On error, redirect to login for safety
    console.error("Auth check failed:", error);
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

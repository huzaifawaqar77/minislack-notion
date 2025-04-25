import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which paths are protected (require authentication)
const protectedPaths = [
  "/dashboard",
  "/settings",
  "/messages",
  "/channels",
  "/workspaces",
  "/projects",
];

// Define which paths are auth paths (login, register, etc.)
const authPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/oauth-success",
  "/auth/oauth-error",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if the path is an auth path
  const isAuthPath = authPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Get the authentication token from the cookies
  const authToken = request.cookies.get("auth_token")?.value;

  // If the path is protected and there's no token, redirect to login
  if (isProtectedPath && !authToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // If the path is an auth path and there's a token, redirect to dashboard
  if (isAuthPath && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Otherwise, continue with the request
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};

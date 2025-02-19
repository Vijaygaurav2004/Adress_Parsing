import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login and signup pages
  if (pathname.startsWith("/login") || 
      pathname.startsWith("/signup") || 
      pathname.startsWith("/_next") || 
      pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // For all other routes, let the client-side auth handle protection
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 
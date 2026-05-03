import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Simple JWT decode for Edge Runtime
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) throw new Error("Invalid token");
      
      const payload = JSON.parse(atob(payloadBase64));
      const role = payload.role;

      if (role !== "SUPER_ADMIN" && role !== "STORE_ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Middleware Auth Error:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Config to only run middleware on relevant paths
export const config = {
  matcher: ["/admin/:path*"],
};

import { NextResponse, type NextRequest } from "next/server";
import { protectedRoutes } from "./lib/rbac";
import { sessionCookieName } from "./lib/supabase/server";

export function middleware(request: NextRequest) {
  const isProtected = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get(sessionCookieName)?.value;
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("x-golding-rbac", "permission-middleware-enabled");
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/organizations/:path*", "/people/:path*", "/rbac/:path*", "/profile/:path*", "/invitations/:path*", "/agents/:path*", "/tasks/:path*", "/approvals/:path*", "/system-health/:path*"],
};

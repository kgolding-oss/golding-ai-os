import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName } from "./lib/supabase/server";

const protectedRoutes = ["/dashboard", "/organizations", "/people", "/profile", "/rbac", "/invitations", "/agents", "/tasks", "/approvals", "/system-health"];

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-path", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  const isProtected = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  if (!isProtected) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const session = request.cookies.get(sessionCookieName)?.value;
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-golding-rbac", "permission-middleware-enabled");
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/organizations/:path*", "/people/:path*", "/profile/:path*", "/rbac/:path*", "/invitations/:path*", "/agents/:path*", "/tasks/:path*", "/approvals/:path*", "/system-health/:path*"],
};

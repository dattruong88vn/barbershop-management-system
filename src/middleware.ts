import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import type { UserRole } from "@/types";

const PROTECTED_ROUTES_BY_ROLE: Record<Exclude<UserRole, "superadmin">, string[]> =
  {
    owner: [
      "/dashboard",
      "/services",
      "/combos",
      "/staff",
      "/branches",
      "/reports",
    ],
    manager: ["/dashboard", "/reports"],
    receptionist: ["/dashboard", "/visits", "/customers"],
    barber: ["/dashboard", "/visits", "/customers"],
    skinner: ["/dashboard", "/visits", "/customers"],
  };

const LOGIN_PATH = "/login";
const CHANGE_PASSWORD_PATH = "/change-password";
const FALLBACK_PATH = "/dashboard";

function isUserRole(role: unknown): role is UserRole {
  return (
    role === "superadmin" ||
    role === "owner" ||
    role === "manager" ||
    role === "receptionist" ||
    role === "barber" ||
    role === "skinner"
  );
}

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  const role = token.role;

  if (!isUserRole(role)) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (token.is_first_login === true) {
    if (matchesRoute(request.nextUrl.pathname, CHANGE_PASSWORD_PATH)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, request.url));
  }

  if (matchesRoute(request.nextUrl.pathname, CHANGE_PASSWORD_PATH)) {
    return NextResponse.redirect(new URL(FALLBACK_PATH, request.url));
  }

  if (role === "superadmin") {
    return NextResponse.next();
  }

  const allowedRoutes = PROTECTED_ROUTES_BY_ROLE[role];

  if (
    allowedRoutes.some((route) => matchesRoute(request.nextUrl.pathname, route))
  ) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(FALLBACK_PATH, request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|.*\\..*).*)"],
};

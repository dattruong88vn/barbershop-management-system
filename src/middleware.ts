import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { ROUTES } from "@/constants/routes";
import { getPostAuthRedirectPath } from "@/lib/authRedirect";
import type { UserRole } from "@/types";

const PROTECTED_ROUTES_BY_ROLE: Record<Exclude<UserRole, "superadmin">, string[]> =
  {
    owner: [
      ROUTES.dashboard,
      ROUTES.ownerServices,
      ROUTES.ownerCombos,
      ROUTES.ownerStaff,
      ROUTES.ownerBranches,
      ROUTES.reports,
    ],
    manager: [ROUTES.dashboard, ROUTES.reports],
    receptionist: [ROUTES.visits, ROUTES.customers],
    barber: [ROUTES.visits, ROUTES.customers],
    skinner: [ROUTES.visits, ROUTES.customers],
  };

const LOGIN_PATH = ROUTES.login;
const CHANGE_PASSWORD_PATH = ROUTES.changePassword;

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
    if (matchesRoute(request.nextUrl.pathname, LOGIN_PATH)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  const role = token.role;

  if (!isUserRole(role)) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (matchesRoute(request.nextUrl.pathname, LOGIN_PATH)) {
    return NextResponse.redirect(
      new URL(getPostAuthRedirectPath(role), request.url),
    );
  }

  if (token.is_first_login === true) {
    if (matchesRoute(request.nextUrl.pathname, CHANGE_PASSWORD_PATH)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, request.url));
  }

  if (matchesRoute(request.nextUrl.pathname, CHANGE_PASSWORD_PATH)) {
    return NextResponse.redirect(
      new URL(getPostAuthRedirectPath(role), request.url),
    );
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

  return NextResponse.redirect(
    new URL(getPostAuthRedirectPath(role), request.url),
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import {
  USER_ROLE_BARBER,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  USER_ROLE_RECEPTIONIST,
  USER_ROLE_SKINNER,
  USER_ROLE_SUPERADMIN,
  USER_ROLES,
} from "@/constants/common";
import { ROUTES } from "@/constants/routes";
import { getPostAuthRedirectPath } from "@/lib/authRedirect";
import type { UserRole } from "@/types";

const PROTECTED_ROUTES_BY_ROLE: Record<Exclude<UserRole, typeof USER_ROLE_SUPERADMIN>, string[]> =
  {
    [USER_ROLE_OWNER]: [
      ROUTES.dashboard,
      ROUTES.ownerServices,
      ROUTES.ownerCombos,
      ROUTES.ownerStaff,
      ROUTES.ownerBranches,
      ROUTES.reports,
    ],
    [USER_ROLE_MANAGER]: [
      ROUTES.dashboard,
      ROUTES.managerServices,
      ROUTES.managerCombos,
      ROUTES.managerStaff,
      ROUTES.managerSelectBranch,
      ROUTES.reports,
    ],
    [USER_ROLE_RECEPTIONIST]: [ROUTES.visits, ROUTES.customers, ROUTES.reports],
    [USER_ROLE_BARBER]: [ROUTES.visits, ROUTES.customers, ROUTES.reports],
    [USER_ROLE_SKINNER]: [ROUTES.visits, ROUTES.customers, ROUTES.reports],
  };

const LOGIN_PATH = ROUTES.login;
const CHANGE_PASSWORD_PATH = ROUTES.changePassword;
const PUBLIC_ROUTES = [ROUTES.designSystem] as const;

function isUserRole(role: unknown): role is UserRole {
  return USER_ROLES.some((userRole) => userRole === role);
}

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function middleware(request: NextRequest) {
  if (
    PUBLIC_ROUTES.some((route) => matchesRoute(request.nextUrl.pathname, route))
  ) {
    return NextResponse.next();
  }

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

  if (role === USER_ROLE_SUPERADMIN) {
    return NextResponse.next();
  }

  const allowedRoutes = PROTECTED_ROUTES_BY_ROLE[role];
  const isReportChildPath = request.nextUrl.pathname.startsWith(
    `${ROUTES.reports}/`,
  );

  if (
    (role === USER_ROLE_RECEPTIONIST ||
      role === USER_ROLE_BARBER ||
      role === USER_ROLE_SKINNER) &&
    isReportChildPath
  ) {
    return NextResponse.redirect(
      new URL(getPostAuthRedirectPath(role), request.url),
    );
  }

  if (
    role === USER_ROLE_MANAGER &&
    matchesRoute(request.nextUrl.pathname, ROUTES.reportBranches)
  ) {
    return NextResponse.redirect(
      new URL(getPostAuthRedirectPath(role), request.url),
    );
  }

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

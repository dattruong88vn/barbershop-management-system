import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type UserRole =
  | "superadmin"
  | "owner"
  | "manager"
  | "receptionist"
  | "barber"
  | "skinner";

const protectedRoutesByRole: Record<Exclude<UserRole, "superadmin">, string[]> =
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

const loginPath = "/login";
const changePasswordPath = "/change-password";
const fallbackPath = "/dashboard";

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
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  const role = token.role;

  if (!isUserRole(role)) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  if (token.is_first_login === true) {
    if (matchesRoute(request.nextUrl.pathname, changePasswordPath)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(changePasswordPath, request.url));
  }

  if (matchesRoute(request.nextUrl.pathname, changePasswordPath)) {
    return NextResponse.redirect(new URL(fallbackPath, request.url));
  }

  if (role === "superadmin") {
    return NextResponse.next();
  }

  const allowedRoutes = protectedRoutesByRole[role];

  if (allowedRoutes.some((route) => matchesRoute(request.nextUrl.pathname, route))) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(fallbackPath, request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|.*\\..*).*)"],
};

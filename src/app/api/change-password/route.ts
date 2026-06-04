import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { ROUTES } from "@/constants/routes";
import { authTexts } from "@/constants/texts";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import type { ChangePasswordRequestBody, UserRole } from "@/types";

const DEFAULT_DASHBOARD_PATH = ROUTES.dashboard;
const STAFF_ROLES: UserRole[] = ["receptionist", "barber", "skinner"];

function isChangePasswordRequestBody(
  body: unknown,
): body is ChangePasswordRequestBody {
  return typeof body === "object" && body !== null;
}

function getChangePasswordRedirectPath(role: unknown): string {
  if (typeof role === "string" && STAFF_ROLES.includes(role as UserRole)) {
    return ROUTES.customers;
  }

  return DEFAULT_DASHBOARD_PATH;
}

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id || !token.username) {
    return NextResponse.json(
      { error: authTexts.api.errors.unauthorized },
      { status: 401 },
    );
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isChangePasswordRequestBody(body)) {
    return NextResponse.json(
      { error: authTexts.api.errors.invalidRequestBody },
      { status: 400 },
    );
  }

  const password =
    typeof body.password === "string" ? body.password.trim() : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword.trim() : "";

  if (!password || !confirmPassword) {
    return NextResponse.json(
      { error: authTexts.api.errors.missingPassword },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: authTexts.api.errors.passwordTooShort },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: authTexts.api.errors.passwordMismatch },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: token.id },
    data: {
      passwordHash: hashPassword(password),
      isFirstLogin: false,
    },
  });

  return NextResponse.json({
    username: token.username,
    redirectTo: getChangePasswordRedirectPath(token.role),
  });
}

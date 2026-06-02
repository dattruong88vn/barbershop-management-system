import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { authTexts } from "@/constants/texts";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

type ChangePasswordRequestBody = {
  password?: unknown;
  confirmPassword?: unknown;
};

const defaultDashboardPath = "/dashboard";

function isChangePasswordRequestBody(
  body: unknown,
): body is ChangePasswordRequestBody {
  return typeof body === "object" && body !== null;
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
    redirectTo: defaultDashboardPath,
  });
}

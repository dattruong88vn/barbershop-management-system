import { ROUTES } from "@/constants/routes";

export function getSafeCallbackPath(callbackUrl: string | null): string | null {
  if (!callbackUrl?.startsWith("/") || callbackUrl.startsWith("//")) {
    return null;
  }

  if (
    callbackUrl === ROUTES.login ||
    callbackUrl.startsWith(`${ROUTES.login}?`) ||
    callbackUrl === ROUTES.changePassword ||
    callbackUrl.startsWith(`${ROUTES.changePassword}?`)
  ) {
    return null;
  }

  return callbackUrl;
}

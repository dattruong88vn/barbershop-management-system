"use client";

import { Suspense, type SyntheticEvent } from "react";
import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthFormShell } from "@/components/design-system/AuthFormShell";
import { FormTextField } from "@/components/design-system/FormTextField";
import { InlineAlert } from "@/components/design-system/InlineAlert";
import { PasswordField } from "@/components/design-system/PasswordField";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { authTexts } from "@/constants/texts";
import { getPostAuthRedirectPath } from "@/lib/authRedirect";

function getSafeCallbackPath(callbackUrl: string | null): string | null {
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl");

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const loginInput = {
      username: username.trim(),
      password,
    };

    if (!loginInput.username || !loginInput.password) {
      setError(authTexts.login.errors.missingCredentials);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        username: loginInput.username,
        password: loginInput.password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(authTexts.login.errors.invalidCredentials);
        return;
      }

      const session = await getSession();
      const safeCallbackPath = getSafeCallbackPath(callbackUrl);
      const redirectPath =
        session?.user.is_first_login === true
          ? ROUTES.changePassword
          : safeCallbackPath ?? getPostAuthRedirectPath(session?.user.role);

      router.replace(redirectPath);
      router.refresh();
    } catch {
      setError(authTexts.login.errors.generic);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      title={authTexts.login.title}
      description={authTexts.login.description}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <FormTextField
          id="username"
          name="username"
          type="text"
          value={username}
          autoComplete="username"
          autoFocus
          label={authTexts.login.usernameLabel}
          placeholder={authTexts.login.usernamePlaceholder}
          required
          onChange={(event) => setUsername(event.target.value)}
        />

        <PasswordField
          name="password"
          label={authTexts.login.passwordLabel}
          value={password}
          autoComplete="current-password"
          placeholder={authTexts.login.passwordPlaceholder}
          showPasswordLabel={authTexts.login.showPassword}
          hidePasswordLabel={authTexts.login.hidePassword}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting}
        loading={isSubmitting}
        className="h-10 w-full rounded-lg disabled:cursor-not-allowed"
      >
        {authTexts.login.submit}
      </Button>

      {error ? <InlineAlert className="mt-3">{error}</InlineAlert> : null}

      <p className="text-center text-xs text-muted-foreground">
        {authTexts.login.supportText}
      </p>
    </AuthFormShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

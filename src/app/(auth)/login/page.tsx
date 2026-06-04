"use client";

import { Suspense, type SyntheticEvent } from "react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import AuthFormShell from "@/app/(auth)/AuthFormShell";
import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { authTexts } from "@/constants/texts";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") ?? ROUTES.dashboard;

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

      router.replace(callbackUrl);
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
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-[13px] font-normal text-text-secondary"
          >
            {authTexts.login.usernameLabel}
          </label>
          <Input
            id="username"
            name="username"
            type="text"
            value={username}
            autoComplete="username"
            autoFocus
            placeholder={authTexts.login.usernamePlaceholder}
            required
            onChange={(event) => setUsername(event.target.value)}
            className="h-10 border-dark-600 bg-dark-400 px-3 text-[13px] text-text-primary shadow-none placeholder:text-text-muted focus-visible:border-gold-muted focus-visible:ring-0"
          />
        </div>

        <PasswordField
          name="password"
          label={authTexts.login.passwordLabel}
          value={password}
          autoComplete="current-password"
          placeholder={authTexts.login.passwordPlaceholder}
          required
          showPasswordLabel={authTexts.login.showPassword}
          hidePasswordLabel={authTexts.login.hidePassword}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 h-10 w-full bg-gold px-5 text-sm font-medium text-dark-100 hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {authTexts.login.submit}
      </Button>

      {error ? <p className="mt-3 text-[13px] text-danger">{error}</p> : null}
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

"use client";

import { Suspense, type SyntheticEvent } from "react";
import { useState } from "react";
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
            className="mb-1.5 block text-label-14 text-gray-900"
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
            className="h-10 border-gray-400 bg-gray-100 px-3 text-label-14 text-gray-1000 shadow-none placeholder:text-gray-700 focus-visible:border-gray-600 focus-visible:ring-gray-600/20"
          />
        </div>

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
        className="mt-6 w-full disabled:cursor-not-allowed"
      >
        {authTexts.login.submit}
      </Button>

      {error ? (
        <div
          role="alert"
          className="mt-3 rounded-md border border-red-900/30 bg-red-100 px-3 py-2 text-copy-13 text-red-900"
        >
          {error}
        </div>
      ) : null}
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

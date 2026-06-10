"use client";

import type { SyntheticEvent } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { AuthFormShell } from "@/components/screens/auth/AuthFormShell";
import { InlineAlert } from "@/components/global/InlineAlert";
import { PasswordField } from "@/components/global/PasswordField";
import { Button } from "@/components/global/ui/button";
import { ROUTES } from "@/constants/routes";
import { authTexts } from "@/constants/texts";
import { useChangePassword } from "@/hooks/useChangePassword";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [serverError, setServerError] = useState("");
  const [isConfirmPasswordTouched, setIsConfirmPasswordTouched] =
    useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const changePassword = useChangePassword();
  const shouldValidatePassword =
    isPasswordTouched || hasSubmitted || password.length > 0;
  const shouldValidateConfirmPassword =
    isConfirmPasswordTouched || hasSubmitted || confirmPassword.length > 0;
  const passwordError =
    shouldValidatePassword && password.length > 0 && password.length < 8
      ? authTexts.changePassword.errors.passwordTooShort
      : "";
  const confirmPasswordError =
    shouldValidateConfirmPassword &&
    confirmPassword.length > 0 &&
    password !== confirmPassword
      ? authTexts.changePassword.errors.passwordMismatch
      : "";
  const isFormValid =
    password.length >= 8 &&
    confirmPassword.length >= 8 &&
    password === confirmPassword;

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
    setServerError("");

    if (!password || !confirmPassword) {
      setServerError(authTexts.changePassword.errors.missingPassword);
      return;
    }

    if (password.length < 8) {
      setServerError(authTexts.changePassword.errors.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setServerError(authTexts.changePassword.errors.passwordMismatch);
      return;
    }

    try {
      const result = await changePassword.mutateAsync({
        password,
        confirmPassword,
      });

      const signInResult = await signIn("credentials", {
        username: result.username,
        password,
        redirect: false,
      });

      if (!signInResult?.ok) {
        setServerError(authTexts.changePassword.errors.changedButSignInFailed);
        router.replace(ROUTES.login);
        return;
      }

      router.replace(result.redirectTo);
      router.refresh();
    } catch (mutationError) {
      setServerError(
        mutationError instanceof Error
          ? mutationError.message
          : authTexts.changePassword.errors.generic,
      );
    }
  }

  return (
    <AuthFormShell
      title={authTexts.changePassword.title}
      description={authTexts.changePassword.description}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <PasswordField
          name="password"
          label={authTexts.changePassword.newPasswordLabel}
          value={password}
          autoComplete="new-password"
          minLength={8}
          placeholder={authTexts.changePassword.passwordPlaceholder}
          required
          error={passwordError}
          showPasswordLabel={authTexts.changePassword.showPassword}
          hidePasswordLabel={authTexts.changePassword.hidePassword}
          onBlur={() => setIsPasswordTouched(true)}
          onChange={(event) => setPassword(event.target.value)}
        />

        <PasswordField
          name="confirmPassword"
          label={authTexts.changePassword.confirmPasswordLabel}
          value={confirmPassword}
          autoComplete="new-password"
          minLength={8}
          placeholder={authTexts.changePassword.confirmPasswordPlaceholder}
          required
          error={confirmPasswordError}
          showPasswordLabel={authTexts.changePassword.showPassword}
          hidePasswordLabel={authTexts.changePassword.hidePassword}
          onBlur={() => setIsConfirmPasswordTouched(true)}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>

      <div className="rounded-lg border border-amber-900/30 bg-amber-100 px-3 py-2">
        <p className="text-xs text-amber-900">
          {authTexts.changePassword.passwordHint}
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={!isFormValid || changePassword.isPending}
        loading={changePassword.isPending}
        className="h-10 w-full rounded-lg disabled:cursor-not-allowed"
      >
        {authTexts.changePassword.submit}
      </Button>

      {serverError ? (
        <InlineAlert className="mt-3">{serverError}</InlineAlert>
      ) : null}
    </AuthFormShell>
  );
}

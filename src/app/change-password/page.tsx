"use client";

import type { SyntheticEvent } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { authTexts } from "@/constants/texts";
import { useChangePassword } from "@/hooks/useChangePassword";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const changePassword = useChangePassword();

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError(authTexts.changePassword.errors.missingPassword);
      return;
    }

    if (password !== confirmPassword) {
      setError(authTexts.changePassword.errors.passwordMismatch);
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
        setError(authTexts.changePassword.errors.changedButSignInFailed);
        router.replace("/login");
        return;
      }

      router.replace(result.redirectTo);
      router.refresh();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : authTexts.changePassword.errors.generic,
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-zinc-950">
            {authTexts.changePassword.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {authTexts.changePassword.description}
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-zinc-800">
              {authTexts.changePassword.newPasswordLabel}
            </span>
            <input
              type="password"
              value={password}
              minLength={8}
              required
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-800">
              {authTexts.changePassword.confirmPasswordLabel}
            </span>
            <input
              type="password"
              value={confirmPassword}
              minLength={8}
              required
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={changePassword.isPending}
          className="mt-6 h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {changePassword.isPending
            ? authTexts.changePassword.submitting
            : authTexts.changePassword.submit}
        </button>
      </form>
    </main>
  );
}

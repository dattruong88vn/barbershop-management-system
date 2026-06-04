"use client";

import type { AuthFormShellProps } from "@/types";

export default function AuthFormShell({
  children,
  description,
  onSubmit,
  title,
}: AuthFormShellProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="w-full max-w-sm rounded-xl border border-dark-500 bg-dark-300 p-8"
    >
      <div className="mb-6">
        <h1 className="text-lg font-medium text-text-primary">{title}</h1>
        {description ? (
          <p className="mt-2 text-[13px] leading-5 text-text-muted">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </form>
  );
}

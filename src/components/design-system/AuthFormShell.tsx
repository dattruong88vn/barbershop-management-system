"use client";

import type { AuthFormShellProps } from "@/types";

export function AuthFormShell({
  children,
  description,
  onSubmit,
  title,
}: AuthFormShellProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-background p-5"
    >
      <div>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </form>
  );
}

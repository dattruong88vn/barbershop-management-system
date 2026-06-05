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
      className="material-base w-full max-w-sm p-8"
    >
      <div className="mb-6">
        <h1 className="text-heading-20 text-gray-1000">{title}</h1>
        {description ? (
          <p className="mt-2 text-copy-13 text-gray-700">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </form>
  );
}

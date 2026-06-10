import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface GeistButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export const GeistButton = React.forwardRef<
  HTMLButtonElement,
  GeistButtonProps
>(
  (
    {
      children,
      className,
      disabled,
      icon,
      loading = false,
      size = "md",
      variant = "primary",
      ...props
    },
    ref,
  ) => {
    const variants = {
      danger: "bg-red-900 text-background-100 hover:opacity-90",
      ghost: "bg-transparent text-gray-1000 hover:bg-gray-200",
      primary: "bg-gray-1000 text-background-100 hover:bg-gray-900",
      secondary: "bg-gray-200 text-gray-1000 hover:bg-gray-300",
    };
    const sizes = {
      lg: "h-11 px-6 text-base",
      md: "h-10 px-4 text-sm",
      sm: "h-8 px-3 text-sm",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          icon
        )}
        {children}
      </button>
    );
  },
);
GeistButton.displayName = "GeistButton";

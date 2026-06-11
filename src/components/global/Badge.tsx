import * as React from "react";

import { cn } from "@/lib/utils";

export interface GeistBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  outline?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "danger" | "warning" | "info";
}

export const GeistBadge = React.forwardRef<HTMLDivElement, GeistBadgeProps>(
  (
    {
      children,
      className,
      outline = false,
      size = "md",
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const variants = {
      danger: outline
        ? "border-red-900 bg-transparent text-red-900"
        : "bg-red-100 text-red-900",
      default: outline
        ? "border-gray-500 bg-transparent text-gray-1000"
        : "bg-gray-200 text-gray-1000",
      info: outline
        ? "border-blue-900 bg-transparent text-blue-900"
        : "bg-blue-100 text-blue-900",
      success: outline
        ? "border-green-900 bg-transparent text-green-900"
        : "bg-green-100 text-green-900",
      warning: outline
        ? "border-amber-900 bg-transparent text-amber-900"
        : "bg-amber-100 text-amber-900",
    };
    const sizes = {
      lg: "px-4 py-1.5 text-base",
      md: "px-3 py-1 text-sm",
      sm: "px-2.5 py-0.5 text-xs",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-transparent font-medium",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GeistBadge.displayName = "GeistBadge";

export interface GeistTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  color?: "default" | "muted" | "subtle";
  size?: "sm" | "md" | "lg";
  variant?: "body" | "caption" | "code";
}

export const GeistText = React.forwardRef<HTMLParagraphElement, GeistTextProps>(
  (
    {
      children,
      className,
      color = "default",
      size = "md",
      variant = "body",
      ...props
    },
    ref,
  ) => {
    const variants = {
      body: "font-normal leading-normal",
      caption: "text-xs font-normal leading-normal",
      code: "rounded bg-gray-200 px-2 py-1 font-mono text-sm",
    };
    const sizes = {
      lg: "text-lg",
      md: "text-base",
      sm: "text-sm",
    };
    const colors = {
      default: "text-gray-1000",
      muted: "text-gray-700",
      subtle: "text-gray-600",
    };

    return (
      <p
        ref={ref}
        className={cn(variants[variant], sizes[size], colors[color], className)}
        {...props}
      >
        {children}
      </p>
    );
  },
);
GeistText.displayName = "GeistText";

export interface GeistLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  size?: "sm" | "md" | "lg";
}

export const GeistLabel = React.forwardRef<HTMLLabelElement, GeistLabelProps>(
  ({ children, className, required = false, size = "md", ...props }, ref) => {
    const sizes = {
      lg: "text-base",
      md: "text-sm",
      sm: "text-xs",
    };

    return (
      <label
        ref={ref}
        className={cn("font-medium text-gray-1000", sizes[size], className)}
        {...props}
      >
        {children}
        {required ? <span className="ml-1 text-red-900">*</span> : null}
      </label>
    );
  },
);
GeistLabel.displayName = "GeistLabel";

export interface GeistDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "sm" | "md";
}

export const GeistDescription = React.forwardRef<
  HTMLParagraphElement,
  GeistDescriptionProps
>(({ children, className, size = "sm", ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-gray-700",
      size === "sm" ? "text-xs" : "text-sm",
      className,
    )}
    {...props}
  >
    {children}
  </p>
));
GeistDescription.displayName = "GeistDescription";

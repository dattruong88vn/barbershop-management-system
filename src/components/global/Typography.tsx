import * as React from "react";

import { cn } from "@/lib/utils";

type HeadingLevel = 1 | 2 | 3 | 4;
type HeadingSize = "page" | "section" | "subsection" | "compact";

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  size?: HeadingSize;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ children, className, level = 2, size = "section", ...props }, ref) => {
    const Component = `h${level}` as React.ElementType;
    const sizes = {
      compact: "text-sm font-semibold",
      page: "text-xl font-semibold md:text-2xl",
      section: "text-base font-semibold",
      subsection: "text-sm font-semibold md:text-base",
    };

    return (
      <Component
        ref={ref}
        className={cn(sizes[size], "text-foreground", className)}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
Heading.displayName = "Heading";

export type PageTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const PageTitle = React.forwardRef<HTMLHeadingElement, PageTitleProps>(
  ({ children, className, ...props }, ref) => (
    <h1 ref={ref} className={cn("text-2xl font-semibold", className)} {...props}>
      {children}
    </h1>
  ),
);
PageTitle.displayName = "PageTitle";

export interface ParagraphProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "md" | "lg";
  tone?: "default" | "muted";
  weight?: "normal" | "medium" | "semibold";
}

export const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      children,
      className,
      size = "sm",
      tone = "default",
      weight = "normal",
      ...props
    },
    ref,
  ) => {
    const sizes = {
      lg: "text-lg",
      md: "text-base",
      sm: "text-sm",
      xs: "text-xs",
    };
    const tones = {
      default: "text-foreground",
      muted: "text-muted-foreground",
    };
    const weights = {
      medium: "font-medium",
      normal: "font-normal",
      semibold: "font-semibold",
    };

    return (
      <p
        ref={ref}
        className={cn(sizes[size], tones[tone], weights[weight], className)}
        {...props}
      >
        {children}
      </p>
    );
  },
);
Paragraph.displayName = "Paragraph";

export interface MetricValueProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "md" | "lg";
}

export const MetricValue = React.forwardRef<
  HTMLParagraphElement,
  MetricValueProps
>(({ children, className, size = "md", ...props }, ref) => {
  const sizes = {
    lg: "text-3xl",
    md: "text-2xl",
  };

  return (
    <p
      ref={ref}
      className={cn(sizes[size], "font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
});
MetricValue.displayName = "MetricValue";

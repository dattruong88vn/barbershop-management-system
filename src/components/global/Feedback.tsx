import * as React from "react";
import { AlertTriangle, CheckCircle2, X, XCircle } from "lucide-react";

import { commonTexts } from "@/constants/texts";
import type { AppToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type FeedbackTone = "success" | "error" | "warning" | "info";

const toneStyles: Record<FeedbackTone, string> = {
  error: "border-red-900/30 bg-red-100 text-red-900",
  info: "border-blue-900/30 bg-blue-100 text-blue-900",
  success: "border-green-900/30 bg-green-100 text-green-900",
  warning: "border-amber-900/30 bg-amber-100 text-amber-900",
};

const notificationIcons = {
  error: XCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
} as const;

export interface GeistToastProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: { label: string; onClick: () => void };
  description?: string;
  title?: string;
  type?: FeedbackTone;
}

export const GeistToast = React.forwardRef<HTMLDivElement, GeistToastProps>(
  (
    { action, children, className, description, title, type = "info", ...props },
    ref,
  ) => (
    <GeistFeedback
      ref={ref}
      action={action}
      className={className}
      message={description}
      title={title}
      type={type}
      {...props}
    >
      {children}
    </GeistFeedback>
  ),
);
GeistToast.displayName = "GeistToast";

export interface GeistBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  dismissible?: boolean;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  title?: string;
  type?: FeedbackTone;
}

export const GeistBanner = React.forwardRef<HTMLDivElement, GeistBannerProps>(
  (
    {
      children,
      className,
      dismissible = false,
      icon,
      onDismiss,
      title,
      type = "info",
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = React.useState(true);

    if (!visible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between gap-4 border-b px-4 py-3 text-sm",
          toneStyles[type],
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          {icon}
          <div>
            {title ? <p className="font-semibold">{title}</p> : null}
            {children}
          </div>
        </div>
        {dismissible ? (
          <button
            aria-label="Dismiss"
            className="min-h-11 px-2 opacity-70 hover:opacity-100"
            type="button"
            onClick={() => {
              setVisible(false);
              onDismiss?.();
            }}
          >
            x
          </button>
        ) : null}
      </div>
    );
  },
);
GeistBanner.displayName = "GeistBanner";

export interface GeistNoteProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  type?: "default" | "info" | "warning" | "success";
}

export const GeistNote = React.forwardRef<HTMLDivElement, GeistNoteProps>(
  ({ children, className, title, type = "default", ...props }, ref) => {
    const styles = {
      default: "border-gray-400 bg-gray-100 text-gray-1000",
      info: toneStyles.info,
      success: toneStyles.success,
      warning: toneStyles.warning,
    };

    return (
      <div
        ref={ref}
        className={cn("rounded-xl border p-4", styles[type], className)}
        {...props}
      >
        {title ? <p className="mb-2 text-sm font-semibold">{title}</p> : null}
        <p className="text-sm">{children}</p>
      </div>
    );
  },
);
GeistNote.displayName = "GeistNote";

export interface GeistErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
  message?: string;
  title?: string;
}

export const GeistError = React.forwardRef<HTMLDivElement, GeistErrorProps>(
  ({ action, children, className, icon, message, title, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border p-4", toneStyles.error, className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon ? <span className="mt-0.5">{icon}</span> : null}
        <div className="flex-1">
          {title ? <p className="mb-1 text-sm font-semibold">{title}</p> : null}
          {message ? <p className="text-sm">{message}</p> : null}
          {children}
        </div>
      </div>
      {action ? (
        <button
          className="mt-3 min-h-11 text-sm font-medium hover:opacity-75"
          type="button"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  ),
);
GeistError.displayName = "GeistError";

export interface GeistFeedbackProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
  message?: string;
  title?: string;
  type?: FeedbackTone;
}

export const GeistFeedback = React.forwardRef<
  HTMLDivElement,
  GeistFeedbackProps
>(
  (
    {
      action,
      children,
      className,
      icon,
      message,
      title,
      type = "info",
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn("relative rounded-xl border p-4", toneStyles[type], className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
          <div className="min-w-0">
            {title ? <p className="mb-1 text-sm font-semibold">{title}</p> : null}
            {message ? <p className="text-sm">{message}</p> : null}
            {children}
          </div>
        </div>
        {action ? (
          <button
            className="min-h-11 shrink-0 text-sm font-medium hover:opacity-75"
            type="button"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  ),
);
GeistFeedback.displayName = "GeistFeedback";

export interface AppFeedbackNotificationProps {
  onClose: () => void;
  toast: AppToast;
}

export function AppFeedbackNotification({
  onClose,
  toast,
}: AppFeedbackNotificationProps) {
  const Icon = notificationIcons[toast.type];

  return (
    <GeistFeedback
      aria-live="polite"
      className="fixed right-4 top-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] pr-12 shadow-lg"
      icon={<Icon className="size-4" aria-hidden="true" />}
      message={toast.description}
      role="status"
      title={toast.message}
      type={toast.type}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 flex size-6 shrink-0 items-center justify-center rounded-md opacity-70 hover:bg-gray-200 hover:opacity-100"
        aria-label={commonTexts.feedback.closeNotification}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </GeistFeedback>
  );
}

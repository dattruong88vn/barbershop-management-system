"use client";

import { AlertTriangle, CheckCircle2, X, XCircle } from "lucide-react";

import type { ToastProps } from "@/types";

const TOAST_VARIANT_STYLES = {
  success: {
    accent: "border-l-green-900",
    icon: "text-green-900",
    Icon: CheckCircle2,
  },
  error: {
    accent: "border-l-red-900",
    icon: "text-red-900",
    Icon: XCircle,
  },
  warning: {
    accent: "border-l-amber-900",
    icon: "text-amber-900",
    Icon: AlertTriangle,
  },
} as const;

export function Toast({ onClose, toast }: ToastProps) {
  const toastVariant = TOAST_VARIANT_STYLES[toast.type];
  const Icon = toastVariant.Icon;

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] gap-3 rounded-md border border-gray-500 border-l-4 bg-gray-200 px-4 py-3 text-gray-1000 shadow-lg ${toastVariant.accent}`}
      role="status"
    >
      <Icon
        className={`mt-0.5 size-4 shrink-0 ${toastVariant.icon}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-label-14 text-gray-1000">{toast.message}</p>
        {toast.description ? (
          <p className="mt-0.5 text-copy-13 text-gray-800">
            {toast.description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex size-6 shrink-0 items-center justify-center rounded-md text-gray-700 hover:bg-gray-300 hover:text-gray-1000"
        aria-label="Đóng thông báo"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

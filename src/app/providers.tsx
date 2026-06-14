"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { AppFeedbackNotification } from "@/components/global";
import {
  API_SERVER_ERROR_EVENT,
  createQueryClient,
} from "@/lib/queryClient";
import { APP_NAVIGATION_EVENT } from "@/lib/appNavigation";
import {
  APP_TOAST_DISMISS_EVENT,
  APP_TOAST_EVENT,
  type AppToast,
} from "@/lib/toast";
import type { ProvidersProps } from "@/types";

const TOAST_VISIBLE_MS = 3000;

export function Providers({ children }: ProvidersProps) {
  const router = useRouter();
  const [queryClient] = useState(() => createQueryClient());
  const [toast, setToast] = useState<AppToast | null>(null);

  useEffect(() => {
    function handleApiServerError(event: Event) {
      if (!(event instanceof CustomEvent) || typeof event.detail !== "string") {
        return;
      }

      setToast({
        message: event.detail,
        type: "error",
      });
    }

    function handleAppToast(event: Event) {
      if (
        !(event instanceof CustomEvent) ||
        typeof event.detail?.message !== "string"
      ) {
        return;
      }

      setToast(event.detail as AppToast);
    }

    function handleAppToastDismiss() {
      setToast(null);
    }

    function handleAppNavigation(event: Event) {
      if (
        !(event instanceof CustomEvent) ||
        typeof event.detail?.href !== "string"
      ) {
        return;
      }

      router.push(event.detail.href);
    }

    window.addEventListener(API_SERVER_ERROR_EVENT, handleApiServerError);
    window.addEventListener(APP_NAVIGATION_EVENT, handleAppNavigation);
    window.addEventListener(APP_TOAST_DISMISS_EVENT, handleAppToastDismiss);
    window.addEventListener(APP_TOAST_EVENT, handleAppToast);

    return () => {
      window.removeEventListener(API_SERVER_ERROR_EVENT, handleApiServerError);
      window.removeEventListener(APP_NAVIGATION_EVENT, handleAppNavigation);
      window.removeEventListener(APP_TOAST_DISMISS_EVENT, handleAppToastDismiss);
      window.removeEventListener(APP_TOAST_EVENT, handleAppToast);
    };
  }, [router]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const _timeoutId = window.setTimeout(() => {
      setToast(null);
    }, TOAST_VISIBLE_MS);

    return () => {
      window.clearTimeout(_timeoutId);
    };
  }, [toast]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {toast ? (
        <AppFeedbackNotification
          toast={toast}
          onClose={() => setToast(null)}
        />
      ) : null}
    </QueryClientProvider>
  );
}

"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import {
  API_SERVER_ERROR_EVENT,
  createQueryClient,
} from "@/lib/queryClient";
import type { ProvidersProps } from "@/types";

const TOAST_VISIBLE_MS = 3000;

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    function handleApiServerError(event: Event) {
      if (!(event instanceof CustomEvent) || typeof event.detail !== "string") {
        return;
      }

      setToastMessage(event.detail);
    }

    window.addEventListener(API_SERVER_ERROR_EVENT, handleApiServerError);

    return () => {
      window.removeEventListener(API_SERVER_ERROR_EVENT, handleApiServerError);
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const _timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, TOAST_VISIBLE_MS);

    return () => {
      window.clearTimeout(_timeoutId);
    };
  }, [toastMessage]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {toastMessage ? (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 max-w-80 rounded-md bg-neutral-950 px-4 py-3 text-sm text-white shadow-lg"
          role="status"
        >
          {toastMessage}
        </div>
      ) : null}
    </QueryClientProvider>
  );
}

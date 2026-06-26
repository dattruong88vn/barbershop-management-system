"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  AppFeedbackNotification,
  ManagementSidebar,
  ManagementSidebarContentOffset,
  StaffDesktopFallback,
} from "@/components/global";
import {
  MANAGEMENT_ROLES,
  STAFF_ROLES,
} from "@/constants/common";
import {
  API_SERVER_ERROR_EVENT,
  createQueryClient,
} from "@/lib/queryClient";
import {
  getProvinces,
  LOCATION_PROVINCES_QUERY_KEY,
  LOCATION_PROVINCES_STALE_TIME_MS,
} from "@/hooks/useLocations";
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

      if (event.detail.signOut === true) {
        void signOut({ callbackUrl: event.detail.href });
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
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <LocationCacheWarmup />
        <RoleAwareAppShell>{children}</RoleAwareAppShell>
        {toast ? (
          <AppFeedbackNotification
            toast={toast}
            onClose={() => setToast(null)}
          />
        ) : null}
      </QueryClientProvider>
    </SessionProvider>
  );
}

function LocationCacheWarmup() {
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const role = session?.user.role;
  const shouldWarmupLocations =
    status === "authenticated" &&
    MANAGEMENT_ROLES.some((managementRole) => managementRole === role);

  useEffect(() => {
    if (!shouldWarmupLocations) {
      return;
    }

    void queryClient.prefetchQuery({
      queryKey: LOCATION_PROVINCES_QUERY_KEY,
      queryFn: getProvinces,
      staleTime: LOCATION_PROVINCES_STALE_TIME_MS,
    });
  }, [queryClient, shouldWarmupLocations]);

  return null;
}

function RoleAwareAppShell({ children }: ProvidersProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <>{children}</>;
  }

  const role = session?.user.role;
  const isStaffRole = STAFF_ROLES.some((staffRole) => staffRole === role);

  if (isStaffRole) {
    return (
      <>
        <div className="lg:hidden">{children}</div>
        <StaffDesktopFallback />
      </>
    );
  }

  return (
    <>
      <ManagementSidebar />
      <ManagementSidebarContentOffset>{children}</ManagementSidebarContentOffset>
    </>
  );
}

export const APP_TOAST_EVENT = "app-toast";

export type AppToastType = "success" | "error" | "warning";

export type AppToast = {
  description?: string;
  message: string;
  type: AppToastType;
};

export function dispatchAppToast(toast: AppToast) {
  window.dispatchEvent(
    new CustomEvent<AppToast>(APP_TOAST_EVENT, {
      detail: toast,
    }),
  );
}

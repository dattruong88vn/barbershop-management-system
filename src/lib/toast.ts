export const APP_TOAST_EVENT = "app-toast";
export const APP_TOAST_DISMISS_EVENT = "app-toast-dismiss";

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

export function dismissAppToast() {
  window.dispatchEvent(new Event(APP_TOAST_DISMISS_EVENT));
}

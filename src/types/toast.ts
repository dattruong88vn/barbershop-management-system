import type { AppToast } from "@/lib/toast";

export type ToastProps = {
  onClose: () => void;
  toast: AppToast;
};

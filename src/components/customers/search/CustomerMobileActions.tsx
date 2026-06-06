import { AppMobileBottomNav } from "@/components/design-system/AppMobileBottomNav";
import type { CustomerMobileActionsProps } from "@/types";

export function CustomerMobileActions({
  onCreateCustomer,
}: CustomerMobileActionsProps) {
  return <AppMobileBottomNav activeItem="search" onCreate={onCreateCustomer} />;
}

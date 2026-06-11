import { getCustomerInitials } from "@/lib/customerDisplay";
import type { CustomerAvatarProps } from "@/types";

export function CustomerAvatar({ customer }: CustomerAvatarProps) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-medium text-foreground">
      {getCustomerInitials(customer.name)}
    </div>
  );
}

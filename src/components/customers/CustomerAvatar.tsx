import { getCustomerInitials } from "@/lib/customerDisplay";
import type { CustomerAvatarProps } from "@/types";

export function CustomerAvatar({ customer }: CustomerAvatarProps) {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-400 bg-gray-200 text-label-13 text-gray-1000 md:size-9 md:text-label-14">
      {getCustomerInitials(customer.name)}
    </div>
  );
}

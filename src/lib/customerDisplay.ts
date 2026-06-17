import type { Customer } from "@/types";
import { formatDisplayDate } from "@/utils/common";

export function getCustomerInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word.charAt(0).toUpperCase());

  return initials.join("") || "?";
}

export function formatCustomerRelativeDate(value: string) {
  return formatDisplayDate(value);
}

export function hasCustomerPhotoWarning(customer: Customer) {
  return Boolean(
    customer.lastVisit &&
      customer.lastVisit.services.length > 0 &&
      customer.lastVisit.photos.length === 0,
  );
}

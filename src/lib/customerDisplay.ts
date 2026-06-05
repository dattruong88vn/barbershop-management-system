import type { Customer } from "@/types";

export function getCustomerInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word.charAt(0).toUpperCase());

  return initials.join("") || "?";
}

export function formatCustomerRelativeDate(value: string) {
  const timestamp = new Date(value).getTime();
  const diffMs = Date.now() - timestamp;
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) {
    return "Hôm nay";
  }

  if (diffDays === 1) {
    return "Hôm qua";
  }

  if (diffDays < 30) {
    return `${diffDays} ngày trước`;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function hasCustomerPhotoWarning(customer: Customer) {
  return Boolean(
    customer.lastVisit &&
      customer.lastVisit.services.length > 0 &&
      customer.lastVisit.photos.length === 0,
  );
}

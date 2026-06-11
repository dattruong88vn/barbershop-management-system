import { customerTexts } from "@/constants/texts";
import type {
  CustomerVisit,
  CustomerVisitPhoto,
  CustomerVisitService,
} from "@/types";

const MONEY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

export function formatCustomerVisitServices(services: CustomerVisitService[]) {
  if (!services.length) {
    return customerTexts.detail.noServices;
  }

  return services.map((service) => service.name).join(" + ");
}

export function formatCompactMoney(value: number) {
  if (value >= 1000000) {
    return `${Number((value / 1000000).toFixed(1))}${customerTexts.detail.millionSuffix}`;
  }

  if (value >= 1000) {
    return `${Math.round(value / 1000)}${customerTexts.detail.thousandSuffix}`;
  }

  return `${MONEY_FORMATTER.format(value)}${customerTexts.detail.currencySuffix}`;
}

export function formatMoney(value: number) {
  return `${MONEY_FORMATTER.format(value)}${customerTexts.detail.currencySuffix}`;
}

export function formatRelativeVisitDate(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) {
    return customerTexts.detail.today;
  }

  if (diffDays === 1) {
    return customerTexts.detail.yesterday;
  }

  if (diffDays < 30) {
    return customerTexts.detail.daysAgo(diffDays);
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

export function formatVisitTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getVisitCycleDays(visits: CustomerVisit[]) {
  if (visits.length < 2) {
    return null;
  }

  const timestamps = visits.map((visit) => new Date(visit.createdAt).getTime());
  const totalDiff = timestamps
    .slice(0, -1)
    .reduce(
      (total, timestamp, index) =>
        total + Math.abs(timestamp - timestamps[index + 1]),
      0,
    );
  const averageMs = totalDiff / (timestamps.length - 1);

  return Math.max(1, Math.round(averageMs / (1000 * 60 * 60 * 24)));
}

export function getRecentVisitPhotos(visits: CustomerVisit[]) {
  const latestVisitWithPhotos = visits.find((visit) => visit.photos.length > 0);

  return latestVisitWithPhotos
    ? [...latestVisitWithPhotos.photos].sort(
        (firstPhoto: CustomerVisitPhoto, secondPhoto: CustomerVisitPhoto) =>
          new Date(secondPhoto.createdAt).getTime() -
          new Date(firstPhoto.createdAt).getTime(),
      )
    : [];
}

export function hasVisitPhotoWarning(visit: CustomerVisit | null) {
  return Boolean(visit && visit.services.length > 0 && visit.photos.length === 0);
}

export function formatSuggestionStaffName(username: string) {
  return username.split(/\s+/).filter(Boolean).at(-1) ?? username;
}

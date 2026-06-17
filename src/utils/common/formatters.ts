const VND_PRICE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DISPLAY_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
});

function toDate(value: string | number | Date) {
  return value instanceof Date ? value : new Date(value);
}

export function formatVndPrice(value: number) {
  return VND_PRICE_FORMATTER.format(value);
}

export function formatDisplayDate(value: string | number | Date) {
  return DISPLAY_DATE_FORMATTER.format(toDate(value));
}

export function formatDisplayTime(value: string | number | Date) {
  return DISPLAY_TIME_FORMATTER.format(toDate(value));
}

export function formatDisplayDateTime(value: string | number | Date) {
  return `${formatDisplayDate(value)} ${formatDisplayTime(value)}`;
}

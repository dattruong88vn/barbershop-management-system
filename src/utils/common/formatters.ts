const VND_PRICE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatVndPrice(value: number) {
  return VND_PRICE_FORMATTER.format(value);
}

import { cn } from "@/lib/utils";

export { cn };

export function geistClass(
  base: string,
  variant?: Record<string, string>,
  active?: string,
) {
  return cn(base, variant && active ? variant[active] : "");
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "vừa xong";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;

  return date.toLocaleDateString("vi-VN");
}

export function middleTruncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const charsToShow = Math.max(maxLength - 3, 0);
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);

  return `${text.substring(0, frontChars)}...${text.substring(text.length - backChars)}`;
}

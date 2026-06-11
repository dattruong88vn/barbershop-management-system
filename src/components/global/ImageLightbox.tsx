"use client";

/* eslint-disable @next/next/no-img-element */

import { X } from "lucide-react";

import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export function ImageLightbox({
  alt,
  closeLabel,
  imageUrl,
  onClose,
}: {
  alt: string;
  closeLabel: string;
  imageUrl: string | null;
  onClose: () => void;
}) {
  useLockBodyScroll(Boolean(imageUrl));

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-md bg-background text-foreground"
        aria-label={closeLabel}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
      <img
        src={imageUrl}
        alt={alt}
        className="max-h-[85vh] max-w-full rounded-md object-contain"
      />
    </div>
  );
}

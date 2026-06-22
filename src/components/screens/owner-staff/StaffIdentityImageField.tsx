"use client";

import { ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { staffTexts } from "@/constants/texts";

type StaffIdentityImageFieldProps = {
  existingUrl?: string;
  label: string;
  onFileChange: (file: File) => boolean;
};

export function StaffIdentityImageField({
  existingUrl,
  label,
  onFileChange,
}: StaffIdentityImageFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState("");
  const previewUrl = selectedPreviewUrl || existingUrl || "";

  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
    };
  }, [selectedPreviewUrl]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-1000">{label}</p>
      <input
        ref={inputRef}
        accept="image/*"
        className="hidden"
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          if (onFileChange(file)) {
            setSelectedPreviewUrl(URL.createObjectURL(file));
          }
        }}
      />
      <button
        aria-label={`${label}: ${staffTexts.ownerStaff.identityImageHint}`}
        className="flex aspect-[1.586/1] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-400 bg-gray-200 transition hover:border-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="size-full object-contain" src={previewUrl} alt={staffTexts.ownerStaff.identityImageAlt.replace("{side}", label)} />
        ) : (
          <div className="flex flex-col items-center gap-2 text-sm text-gray-700">
            <ImageIcon className="size-7" aria-hidden="true" />
            {staffTexts.ownerStaff.identityImageHint}
          </div>
        )}
      </button>
    </div>
  );
}

"use client";

/* eslint-disable @next/next/no-img-element */

import type { ChangeEvent } from "react";
import { useRef } from "react";
import { ImageIcon, Plus, Upload, X } from "lucide-react";

import { InlineAlert } from "@/components/global/InlineAlert";
import { Button } from "@/components/global/ui/button";
import { VisitSectionShell } from "./VisitSectionShell";
import { visitTexts } from "@/constants/texts";
import type { CustomerVisitPhoto } from "@/types";

export function VisitPhotosSection({
  canUploadPhotos,
  deleteError,
  hasPendingPhotoRefresh,
  isDeletingPhoto,
  isRefreshingDetail,
  isUploadingPhoto,
  onDeletePhoto,
  onRefreshDetail,
  onSelectPhoto,
  onUploadPhoto,
  photos,
  uploadError,
}: {
  canUploadPhotos: boolean;
  deleteError: string;
  hasPendingPhotoRefresh: boolean;
  isDeletingPhoto: boolean;
  isRefreshingDetail: boolean;
  isUploadingPhoto: boolean;
  onDeletePhoto?: (photo: CustomerVisitPhoto) => Promise<void>;
  onRefreshDetail?: () => Promise<void>;
  onSelectPhoto: (photo: CustomerVisitPhoto) => void;
  onUploadPhoto: (file: File) => Promise<void>;
  photos: CustomerVisitPhoto[];
  uploadError: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleOpenFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await onUploadPhoto(file);
  }

  const refreshAction =
    hasPendingPhotoRefresh && onRefreshDetail ? (
      <Button
        type="button"
        loading={isRefreshingDetail}
        variant="primary"
        className="h-9 rounded-lg disabled:cursor-not-allowed"
        onClick={onRefreshDetail}
      >
        {isRefreshingDetail
          ? visitTexts.detail.refreshingDetail
          : visitTexts.detail.refreshDetail}
      </Button>
    ) : null;

  return (
    <VisitSectionShell action={refreshAction} title={visitTexts.detail.photosTitle}>
      {canUploadPhotos ? (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      ) : null}

      {uploadError || deleteError ? (
        <InlineAlert className="mb-3">{uploadError || deleteError}</InlineAlert>
      ) : null}

      {photos.length ? (
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square">
              <button
                type="button"
                onClick={() => onSelectPhoto(photo)}
                className="size-full overflow-hidden rounded-lg border border-border bg-background transition hover:border-ring"
              >
                <img
                  src={photo.photoUrl}
                  alt={visitTexts.detail.photosTitle}
                  className="size-full object-cover"
                />
              </button>
              {canUploadPhotos && onDeletePhoto ? (
                <Button
                  type="button"
                  aria-label={visitTexts.detail.deletePhoto}
                  title={
                    isDeletingPhoto
                      ? visitTexts.detail.deletingPhoto
                      : visitTexts.detail.deletePhoto
                  }
                  disabled={isDeletingPhoto}
                  size="icon"
                  variant="secondary"
                  className="absolute right-1 top-1 size-7 rounded-full border border-border bg-background/90 text-foreground shadow-sm hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed"
                  onClick={() => onDeletePhoto(photo)}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          ))}
          {canUploadPhotos ? (
            <button
              type="button"
              aria-label={visitTexts.detail.uploadPhoto}
              title={
                isUploadingPhoto
                  ? visitTexts.detail.uploadingPhoto
                  : visitTexts.detail.uploadPhoto
              }
              disabled={isUploadingPhoto}
              onClick={handleOpenFilePicker}
              className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-ring hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-6" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : canUploadPhotos ? (
        <button
          type="button"
          disabled={isUploadingPhoto}
          onClick={handleOpenFilePicker}
          className="flex min-h-28 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition hover:border-ring hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="mr-2 size-5" aria-hidden="true" />
          {isUploadingPhoto
            ? visitTexts.detail.uploadingPhoto
            : visitTexts.detail.uploadPhoto}
        </button>
      ) : (
        <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          <ImageIcon className="mr-2 size-5" aria-hidden="true" />
          {visitTexts.detail.noPhotos}
        </div>
      )}
    </VisitSectionShell>
  );
}

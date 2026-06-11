/* eslint-disable @next/next/no-img-element */

import { ImageIcon } from "lucide-react";

import { CustomerSectionSkeleton } from "@/components/modules/customers";
import { customerTexts } from "@/constants/texts";
import type { CustomerVisitPhoto } from "@/types";

export function PhotosSection({
  isLoading,
  onSelectPhoto,
  recentPhotos,
}: {
  isLoading: boolean;
  onSelectPhoto: (photo: CustomerVisitPhoto) => void;
  recentPhotos: CustomerVisitPhoto[];
}) {
  return (
    <section className="mt-5 border-border md:mt-5 md:border-t md:pt-5">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="md:hidden">
          {customerTexts.detail.photosRecentTitleShort}
        </span>
        <span className="hidden md:inline">
          {customerTexts.detail.photosRecentTitle}
        </span>
      </h3>
      {isLoading ? (
        <CustomerSectionSkeleton itemCount={4} variant="photos" />
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3">
          {recentPhotos.length ? (
            <>
              {recentPhotos.slice(0, 3).map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => onSelectPhoto(photo)}
                  className="aspect-square overflow-hidden rounded-lg border border-border bg-background transition hover:border-ring"
                >
                  <img
                    src={photo.photoUrl}
                    alt={customerTexts.detail.photosLabel}
                    className="size-full object-cover"
                  />
                </button>
              ))}
              {recentPhotos.length > 3 ? (
                <button
                  type="button"
                  onClick={() => onSelectPhoto(recentPhotos[3])}
                  className="flex aspect-square items-center justify-center rounded-lg border border-border bg-background text-base font-semibold text-muted-foreground transition hover:border-ring hover:text-foreground"
                >
                  {customerTexts.detail.morePhotos(recentPhotos.length - 3)}
                </button>
              ) : null}
            </>
          ) : (
            <div className="col-span-3 flex aspect-[3/1] items-center justify-center rounded-lg border border-dashed border-border bg-background text-sm text-muted-foreground md:col-span-4 md:aspect-[4/1]">
              <ImageIcon className="mr-2 size-5" aria-hidden="true" />
              {customerTexts.detail.noPhotos}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ReceiptText } from "lucide-react";

import { EmptyState } from "@/components/design-system/EmptyState";
import { ImageLightbox } from "@/components/design-system/ImageLightbox";
import { InlineAlert } from "@/components/design-system/InlineAlert";
import { Skeleton } from "@/components/design-system/Skeleton";
import { ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import type { CustomerVisit, CustomerVisitPhoto, VisitDetailViewProps } from "@/types";
import {
  VisitDetailMainSections,
  VisitDetailSidebar,
} from "./VisitDetailSections";

const STAFF_EDIT_WINDOW_MS = 3 * 60 * 60 * 1000;

function canEditStaff(visit: CustomerVisit) {
  if (visit.status !== "completed" || !visit.completedAt) {
    return false;
  }

  return Date.now() <= new Date(visit.completedAt).getTime() + STAFF_EDIT_WINDOW_MS;
}

function VisitDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-52 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

function VisitDetailHeader() {
  return (
    <header className="mb-4 flex items-center justify-between gap-4 md:mb-6">
      <div className="min-w-0">
        <Link
          href={ROUTES.customers}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {visitTexts.detail.backToCustomers}
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-foreground md:text-2xl">
          {visitTexts.detail.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {visitTexts.detail.description}
        </p>
      </div>
    </header>
  );
}

export function VisitDetailView({
  barbers,
  error,
  isLoading,
  isUpdatingStaff,
  onUpdateError,
  onUpdateStaff,
  skinners,
  updateError,
  visit,
}: VisitDetailViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerVisitPhoto | null>(
    null,
  );

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-4 pb-8 text-foreground md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <VisitDetailHeader />

        {isLoading ? <VisitDetailSkeleton /> : null}

        {error ? (
          <InlineAlert>
            {error instanceof Error
              ? error.message
              : visitTexts.detail.errors.generic}
          </InlineAlert>
        ) : null}

        {!isLoading && !error && !visit ? (
          <EmptyState icon={ReceiptText} text={visitTexts.detail.errors.notFound} />
        ) : null}

        {visit ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <VisitDetailMainSections
              visit={visit}
              onSelectPhoto={setSelectedPhoto}
            />
            <VisitDetailSidebar
              barbers={barbers}
              isStaffEditable={canEditStaff(visit)}
              isUpdatingStaff={isUpdatingStaff}
              skinners={skinners}
              updateError={updateError}
              visit={visit}
              onUpdateError={onUpdateError}
              onUpdateStaff={onUpdateStaff}
            />
          </div>
        ) : null}
      </div>

      <ImageLightbox
        alt={visitTexts.detail.photosTitle}
        closeLabel={visitTexts.detail.closeEditStaff}
        imageUrl={selectedPhoto?.photoUrl ?? null}
        onClose={() => setSelectedPhoto(null)}
      />
    </main>
  );
}

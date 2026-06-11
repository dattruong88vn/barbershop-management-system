"use client";

import { X } from "lucide-react";

import { Button } from "@/components/global/ui/button";
import { visitTexts } from "@/constants/texts";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import type {
  CustomerVisit,
  VisitContextValue,
} from "@/types";
import { VisitDetailEditForm } from "./VisitDetailEditForm";

export function VisitDetailEditModal({
  barbers,
  combos,
  isUpdatingDetail,
  isUpdatingStaff,
  onClose,
  onUpdateDetail,
  onUpdateStaff,
  open,
  services,
  skinners,
  visit,
}: {
  barbers: VisitContextValue["barbers"];
  combos: VisitContextValue["combos"];
  isUpdatingDetail: boolean;
  isUpdatingStaff: boolean;
  onClose: () => void;
  onUpdateDetail: VisitContextValue["updateVisitDetail"];
  onUpdateStaff: VisitContextValue["updateVisitStaff"];
  open: boolean;
  services: VisitContextValue["services"];
  skinners: VisitContextValue["skinners"];
  visit: CustomerVisit;
}) {
  useLockBodyScroll(open);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 py-4 md:items-center">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-background p-4 shadow-lg md:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground md:text-xl">
            {visitTexts.detail.editVisitTitle}
          </h2>
          <Button
            type="button"
            aria-label={visitTexts.detail.closeEditVisit}
            size="icon"
            variant="ghost"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <VisitDetailEditForm
          barbers={barbers}
          combos={combos}
          isUpdatingDetail={isUpdatingDetail}
          isUpdatingStaff={isUpdatingStaff}
          services={services}
          skinners={skinners}
          visit={visit}
          onCancel={onClose}
          onUpdateDetail={onUpdateDetail}
          onUpdateStaff={onUpdateStaff}
        />
      </div>
    </div>
  );
}

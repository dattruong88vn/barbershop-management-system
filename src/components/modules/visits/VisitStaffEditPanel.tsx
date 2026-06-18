"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import {
  UI_VARIANT_SECONDARY,
} from "@/constants/common";

import { InlineAlert } from "@/components/global/InlineAlert";
import { Button } from "@/components/global/ui/button";
import { visitTexts } from "@/constants/texts";
import type { VisitStaffEditFormProps } from "@/types";
import { VisitStaffEditForm } from "./VisitStaffEditForm";
import { VisitSectionShell } from "./VisitSectionShell";

export function VisitStaffEditPanel({
  barbers,
  isStaffEditable,
  isUpdatingStaff,
  onError,
  onUpdateStaff,
  skinners,
  updateError,
  visit,
}: Omit<VisitStaffEditFormProps, "onCancel"> & {
  isStaffEditable: boolean;
  updateError: string;
}) {
  const [isEditingStaff, setIsEditingStaff] = useState(false);

  return (
    <VisitSectionShell title={visitTexts.staffEdit.title}>
      {isStaffEditable ? (
        <Button
          type="button"
          variant={UI_VARIANT_SECONDARY}
          className="w-full"
          onClick={() => {
            onError("");
            setIsEditingStaff((current) => !current);
          }}
        >
          {isEditingStaff ? (
            <X className="size-4" aria-hidden="true" />
          ) : (
            <Pencil className="size-4" aria-hidden="true" />
          )}
          {isEditingStaff
            ? visitTexts.detail.closeEditStaff
            : visitTexts.detail.editStaff}
        </Button>
      ) : (
        <InlineAlert className="border-amber-900/40 bg-amber-100 text-amber-900">
          {visitTexts.staffEdit.locked}
        </InlineAlert>
      )}

      {updateError ? <InlineAlert className="mt-4">{updateError}</InlineAlert> : null}

      {isEditingStaff ? (
        <VisitStaffEditForm
          barbers={barbers}
          isUpdatingStaff={isUpdatingStaff}
          skinners={skinners}
          visit={visit}
          onCancel={() => setIsEditingStaff(false)}
          onError={onError}
          onUpdateStaff={onUpdateStaff}
        />
      ) : null}
    </VisitSectionShell>
  );
}

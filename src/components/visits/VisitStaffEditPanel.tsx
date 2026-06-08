"use client";

import { useState, type SyntheticEvent } from "react";
import { Pencil, X } from "lucide-react";

import { InlineAlert } from "@/components/design-system/InlineAlert";
import { Button } from "@/components/ui/button";
import { visitTexts } from "@/constants/texts";
import type { VisitStaffEditFormProps, VisitStaffUpdateInput } from "@/types";
import { VisitSectionShell } from "./VisitSectionShell";

function VisitStaffEditForm({
  barbers,
  isUpdatingStaff,
  onCancel,
  onError,
  onUpdateStaff,
  skinners,
  visit,
}: VisitStaffEditFormProps) {
  const [barberId, setBarberId] = useState(visit.barber?.id ?? "");
  const [skinnerId, setSkinnerId] = useState(visit.skinner?.id ?? "");

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    onError("");

    try {
      const input: VisitStaffUpdateInput = {
        barberId: barberId || null,
        customerId: "",
        skinnerId: skinnerId || null,
        visitId: visit.id,
      };

      await onUpdateStaff(input);
      onCancel();
    } catch (mutationError) {
      onError(
        mutationError instanceof Error
          ? mutationError.message
          : visitTexts.staffEdit.errors.generic,
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-foreground">
          {visitTexts.create.barberLabel}
        </span>
        <select
          value={barberId}
          onChange={(event) => setBarberId(event.target.value)}
          className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring"
        >
          <option value="">{visitTexts.create.noStaffOption}</option>
          {barbers.map((barber) => (
            <option key={barber.id} value={barber.id}>
              {barber.username}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">
          {visitTexts.create.skinnerLabel}
        </span>
        <select
          value={skinnerId}
          onChange={(event) => setSkinnerId(event.target.value)}
          className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring"
        >
          <option value="">{visitTexts.create.noStaffOption}</option>
          {skinners.map((skinner) => (
            <option key={skinner.id} value={skinner.id}>
              {skinner.username}
            </option>
          ))}
        </select>
      </label>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {visitTexts.detail.closeEditStaff}
        </Button>
        <Button type="submit" variant="primary" loading={isUpdatingStaff}>
          {visitTexts.staffEdit.submit}
        </Button>
      </div>
    </form>
  );
}

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
          variant="secondary"
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

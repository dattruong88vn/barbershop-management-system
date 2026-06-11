"use client";

import { useState, type SyntheticEvent } from "react";

import { Button } from "@/components/global/ui/button";
import { visitTexts } from "@/constants/texts";
import type { VisitStaffEditFormProps, VisitStaffUpdateInput } from "@/types";

export function VisitStaffEditForm({
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
          <option value="">{visitTexts.create.barberPlaceholder}</option>
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
          <option value="">{visitTexts.create.skinnerPlaceholder}</option>
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

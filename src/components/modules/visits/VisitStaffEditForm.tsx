"use client";

import { useState, type SyntheticEvent } from "react";
import {
  UI_VARIANT_GHOST,
  UI_VARIANT_PRIMARY,
} from "@/constants/common";

import { Button, Select } from "@/components/global";
import { visitTexts } from "@/constants/texts";
import type { VisitStaffEditFormProps, VisitStaffUpdateInput } from "@/types";
import { getStaffDisplayName } from "@/utils/staff";

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
        <Select
          className="mt-2"
          value={barberId}
          onChange={(event) => setBarberId(event.target.value)}
        >
          <option value="">{visitTexts.create.barberPlaceholder}</option>
          {barbers.map((barber) => (
            <option key={barber.id} value={barber.id}>
              {getStaffDisplayName(barber)}
            </option>
          ))}
        </Select>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-foreground">
          {visitTexts.create.skinnerLabel}
        </span>
        <Select
          className="mt-2"
          value={skinnerId}
          onChange={(event) => setSkinnerId(event.target.value)}
        >
          <option value="">{visitTexts.create.skinnerPlaceholder}</option>
          {skinners.map((skinner) => (
            <option key={skinner.id} value={skinner.id}>
              {getStaffDisplayName(skinner)}
            </option>
          ))}
        </Select>
      </label>

      <div className="flex justify-end gap-3">
        <Button type="button" variant={UI_VARIANT_GHOST} onClick={onCancel}>
          {visitTexts.detail.closeEditStaff}
        </Button>
        <Button type="submit" variant={UI_VARIANT_PRIMARY} loading={isUpdatingStaff}>
          {visitTexts.staffEdit.submit}
        </Button>
      </div>
    </form>
  );
}

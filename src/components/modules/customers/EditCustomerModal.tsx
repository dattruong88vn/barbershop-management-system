"use client";

import type { SyntheticEvent } from "react";
import { X } from "lucide-react";
import {
  UI_VARIANT_GHOST,
  UI_VARIANT_PRIMARY,
} from "@/constants/common";

import { FormTextField } from "@/components/global/FormTextField";
import { InlineAlert } from "@/components/global/InlineAlert";
import { Button } from "@/components/global/ui/button";
import { customerTexts } from "@/constants/texts";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export function EditCustomerModal({
  error,
  isOpen,
  isUpdating,
  name,
  onClose,
  onNameChange,
  onPhoneChange,
  onSubmit,
  phone,
}: {
  error: string;
  isOpen: boolean;
  isUpdating: boolean;
  name: string;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  phone: string;
}) {
  useLockBodyScroll(isOpen);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/40 p-0 md:items-center md:justify-center md:p-6">
      <form
        onSubmit={onSubmit}
        className="w-full rounded-t-xl border border-border bg-background p-5 md:max-w-md md:rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-base font-semibold text-foreground">
            {customerTexts.detail.editTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={customerTexts.lookup.modalClose}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <FormTextField
            id="customer-name"
            label={customerTexts.lookup.nameLabel}
            value={name}
            required
            onChange={(event) => onNameChange(event.target.value)}
          />
          <FormTextField
            id="customer-phone"
            label={customerTexts.lookup.phoneLabel}
            value={phone}
            required
            type="tel"
            onChange={(event) => onPhoneChange(event.target.value)}
          />
        </div>

        {error ? <InlineAlert className="mt-4">{error}</InlineAlert> : null}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant={UI_VARIANT_GHOST} onClick={onClose}>
            {customerTexts.lookup.cancelCreate}
          </Button>
          <Button type="submit" variant={UI_VARIANT_PRIMARY} loading={isUpdating}>
            {customerTexts.detail.submitUpdate}
          </Button>
        </div>
      </form>
    </div>
  );
}

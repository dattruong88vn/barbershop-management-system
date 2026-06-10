import { X } from "lucide-react";

import { FormTextField } from "@/components/global/FormTextField";
import { InlineAlert } from "@/components/global/InlineAlert";
import { Button } from "@/components/global/ui/button";
import { customerTexts } from "@/constants/texts";
import type { CreateCustomerModalProps } from "@/types";

export function CreateCustomerModal({
  error,
  isCreating,
  name,
  onClose,
  onNameChange,
  onPhoneChange,
  onSubmit,
  phone,
}: CreateCustomerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/40 p-0 md:items-center md:justify-center md:p-6">
      <form
        onSubmit={onSubmit}
        className="w-full rounded-t-xl border border-border bg-background p-5 md:max-w-md md:rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-base font-semibold text-foreground">
            {customerTexts.lookup.createTitle}
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
            id="new-customer-name"
            type="text"
            value={name}
            label={customerTexts.lookup.nameLabel}
            placeholder={customerTexts.lookup.namePlaceholder}
            required
            onChange={onNameChange}
            className="mt-2"
          />

          <FormTextField
            id="new-customer-phone"
            type="tel"
            value={phone}
            label={customerTexts.lookup.phoneLabel}
            placeholder={customerTexts.lookup.phonePlaceholder}
            required
            onChange={onPhoneChange}
            className="mt-2"
          />
        </div>

        {error ? <InlineAlert className="mt-4">{error}</InlineAlert> : null}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            {customerTexts.lookup.cancelCreate}
          </Button>
          <Button type="submit" variant="primary" loading={isCreating}>
            {customerTexts.lookup.submitCreate}
          </Button>
        </div>
      </form>
    </div>
  );
}

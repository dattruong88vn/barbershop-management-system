import { UserPlus } from "lucide-react";

import { customerTexts } from "@/constants/texts";
import type { CustomerMobileHeaderProps } from "@/types";

export function CustomerMobileHeader({
  onCreateCustomer,
}: CustomerMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <div className="size-8" aria-hidden="true" />
      <h1 className="text-sm font-semibold text-foreground">
        {customerTexts.lookup.title}
      </h1>
      <button
        type="button"
        onClick={onCreateCustomer}
        className="flex size-8 items-center justify-center rounded-full bg-foreground text-background"
        aria-label={customerTexts.lookup.createOption}
      >
        <UserPlus className="size-4" aria-hidden="true" />
      </button>
    </header>
  );
}

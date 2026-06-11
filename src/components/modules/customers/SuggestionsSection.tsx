import { Scissors, User } from "lucide-react";

import { CustomerSectionSkeleton } from "@/components/modules/customers";
import { customerTexts } from "@/constants/texts";
import {
  formatCustomerVisitServices,
  formatSuggestionStaffName,
} from "@/lib/customerVisitDisplay";
import type { CustomerVisitSuggestion } from "@/types";

export function SuggestionsSection({
  isLoading,
  suggestions,
}: {
  isLoading: boolean;
  suggestions: CustomerVisitSuggestion | null;
}) {
  if (isLoading) {
    return (
      <section className="mt-5 border-border md:mt-6 md:border-t md:pt-5">
        <CustomerSectionSkeleton itemCount={3} variant="chips" />
      </section>
    );
  }

  if (!suggestions) {
    return null;
  }

  return (
    <section className="mt-5 border-border md:mt-6 md:border-t md:pt-5">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="md:hidden">
          {customerTexts.detail.suggestionTitleShort}
        </span>
        <span className="hidden md:inline">
          {customerTexts.detail.suggestionTitle}
        </span>
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
          <Scissors className="size-4" aria-hidden="true" />
          {formatCustomerVisitServices(suggestions.services)}
        </span>
        {suggestions.barber ? (
          <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
            <User className="size-4" aria-hidden="true" />
            <span className="md:hidden">
              {formatSuggestionStaffName(suggestions.barber.username)}
            </span>
            <span className="hidden md:inline">
              {customerTexts.detail.barberLabelShort}:{" "}
              {suggestions.barber.username}
            </span>
          </span>
        ) : null}
        {suggestions.skinner ? (
          <span className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground md:inline-flex">
            <User className="size-4" aria-hidden="true" />
            {customerTexts.detail.skinnerLabel}:{" "}
            {suggestions.skinner.username}
          </span>
        ) : null}
      </div>
    </section>
  );
}

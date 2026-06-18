import { Search, X } from "lucide-react";
import {
  UI_VARIANT_PRIMARY,
} from "@/constants/common";

import { Button } from "@/components/global/ui/button";
import { commonTexts, visitTexts } from "@/constants/texts";
import type { VisitCreatePageViewProps } from "@/types";

export function VisitCustomerSearchForm({
  onClearSearch,
  onSearch,
  onSearchInputChange,
  searchInput,
}: Pick<
  VisitCreatePageViewProps,
  "onClearSearch" | "onSearch" | "onSearchInputChange" | "searchInput"
>) {
  return (
    <form onSubmit={onSearch} className="mt-4">
      <label
        className="text-sm font-medium text-foreground"
        htmlFor="visit-customer-search"
      >
        {visitTexts.create.customerSearchLabel}
      </label>
      <div className="mt-2 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="visit-customer-search"
            value={searchInput}
            onChange={onSearchInputChange}
            placeholder={visitTexts.create.customerSearchPlaceholder}
            className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-11 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring"
          />
          {searchInput && onClearSearch ? (
            <button
              aria-label={commonTexts.feedback.clearSearch}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              type="button"
              onClick={onClearSearch}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <Button type="submit" variant={UI_VARIANT_PRIMARY} className="h-11 shrink-0">
          {visitTexts.create.customerSearchButton}
        </Button>
      </div>
    </form>
  );
}

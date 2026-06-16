import { Search } from "lucide-react";

import { Button } from "@/components/global/ui/button";
import { visitTexts } from "@/constants/texts";
import type { VisitCreatePageViewProps } from "@/types";

export function VisitCustomerSearchForm({
  onSearch,
  onSearchInputChange,
  searchInput,
}: Pick<
  VisitCreatePageViewProps,
  "onSearch" | "onSearchInputChange" | "searchInput"
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
            className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring"
          />
        </div>
        <Button type="submit" variant="primary" className="h-11 shrink-0">
          {visitTexts.create.customerSearchButton}
        </Button>
      </div>
    </form>
  );
}

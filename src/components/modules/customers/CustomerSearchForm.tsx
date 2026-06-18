import { Search, UserPlus, X } from "lucide-react";
import {
  UI_VARIANT_PRIMARY,
} from "@/constants/common";

import { Button } from "@/components/global/ui/button";
import { Input } from "@/components/global/ui/input";
import { customerTexts } from "@/constants/texts";
import type { CustomerSearchFormProps } from "@/types";

export function CustomerSearchForm({
  onClearSearch,
  onCreateCustomer,
  onSearch,
  onSearchInputChange,
  searchInput,
}: CustomerSearchFormProps) {
  return (
    <section>
      <form onSubmit={onSearch} className="flex gap-3">
        <label className="sr-only" htmlFor="customer-search">
          {customerTexts.lookup.searchLabel}
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-700"
            aria-hidden="true"
          />
          <Input
            id="customer-search"
            type="search"
            value={searchInput}
            placeholder=""
            autoFocus
            onChange={onSearchInputChange}
            className="h-11 rounded-xl border-border bg-background pl-9 pr-10 text-base text-foreground shadow-none focus-visible:border-ring focus-visible:ring-ring/20"
          />
          <span className="pointer-events-none absolute left-9 top-1/2 hidden -translate-y-1/2 text-label-14 text-gray-700 md:inline">
            {searchInput ? "" : customerTexts.lookup.searchPlaceholder}
          </span>
          <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-label-14 text-gray-700 md:hidden">
            {searchInput ? "" : customerTexts.lookup.searchPlaceholderMobile}
          </span>
          {searchInput ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={customerTexts.lookup.clearSearch}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <Button
          type="button"
          variant={UI_VARIANT_PRIMARY}
          size="lg"
          onClick={onCreateCustomer}
          className="hidden h-11 rounded-xl md:inline-flex"
        >
          <UserPlus className="size-4" aria-hidden="true" />
          {customerTexts.lookup.createOption}
        </Button>
      </form>
    </section>
  );
}

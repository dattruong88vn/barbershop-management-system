import { Search, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <section className="pt-3 md:pt-8">
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
            className="h-11 border-gray-400 bg-gray-100 pl-9 pr-10 text-label-14 text-gray-1000 shadow-none focus-visible:border-gray-600 focus-visible:ring-gray-600/20"
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
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-700 hover:bg-gray-200"
              aria-label={customerTexts.lookup.clearSearch}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onCreateCustomer}
          className="hidden md:inline-flex"
        >
          <UserPlus className="size-4" aria-hidden="true" />
          {customerTexts.lookup.createOption}
        </Button>
      </form>
    </section>
  );
}

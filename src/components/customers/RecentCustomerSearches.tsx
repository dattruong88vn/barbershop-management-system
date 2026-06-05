import { Clock } from "lucide-react";

import { customerTexts } from "@/constants/texts";
import type { RecentCustomerSearchesProps } from "@/types";

export function RecentCustomerSearches({
  onSelectSearch,
  searches,
}: RecentCustomerSearchesProps) {
  if (!searches.length) {
    return null;
  }

  return (
    <section className="mt-6">
      <p className="text-label-12 uppercase text-gray-700">
        {customerTexts.lookup.recentSearches}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {searches.map((search) => (
          <button
            key={search}
            type="button"
            onClick={() => onSelectSearch(search)}
            className="inline-flex h-8 items-center gap-1 rounded-full border border-gray-400 bg-gray-100 px-3 text-label-12 text-gray-900"
          >
            <Clock className="size-3.5" aria-hidden="true" />
            {search}
          </button>
        ))}
      </div>
    </section>
  );
}

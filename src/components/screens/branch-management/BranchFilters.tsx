import type { FormEvent } from "react";

import { Button, Card, SearchInput, Select } from "@/components/global";
import {
  BRANCH_STATUS_ACTIVE,
  BRANCH_STATUS_ALL,
  BRANCH_STATUS_INACTIVE,
  type BranchStatusFilterValue,
} from "@/constants/common";
import { branchTexts, commonTexts } from "@/constants/texts";

import type { BranchFilters as BranchFiltersValue } from "./branchManagementTypes";

type BranchFiltersProps = {
  filters: BranchFiltersValue;
  onApply: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (filters: BranchFiltersValue) => void;
};

export function BranchFilters({ filters, onApply, onChange }: BranchFiltersProps) {
  return (
    <Card padding="lg" title={branchTexts.ownerBranches.filterTitle}>
      <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem_auto]" onSubmit={onApply}>
        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {branchTexts.ownerBranches.searchLabel}
          </span>
          <SearchInput
            className="mt-2"
            clearLabel={commonTexts.feedback.clearSearch}
            placeholder={branchTexts.ownerBranches.searchPlaceholder}
            value={filters.search}
            onClear={() => onChange({ ...filters, search: "" })}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {branchTexts.ownerBranches.statusLabel}
          </span>
          <Select
            className="mt-2"
            value={filters.status}
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target.value as BranchStatusFilterValue,
              })
            }
          >
            <option value={BRANCH_STATUS_ALL}>{branchTexts.ownerBranches.statuses.all}</option>
            <option value={BRANCH_STATUS_ACTIVE}>{branchTexts.ownerBranches.statuses.active}</option>
            <option value={BRANCH_STATUS_INACTIVE}>{branchTexts.ownerBranches.statuses.inactive}</option>
          </Select>
        </label>

        <div className="flex items-end justify-end">
          <Button type="submit">{branchTexts.ownerBranches.applyFilters}</Button>
        </div>
      </form>
    </Card>
  );
}

import type { FormEvent } from "react";

import { Button, Card, Input, Select } from "@/components/global";
import { STAFF_ROLES } from "@/constants/common";
import { staffTexts } from "@/constants/texts";
import type { Branch } from "@/types";
import {
  ALL_FILTER_VALUE,
  STAFF_DISPLAY_STATUS_ACTIVE,
  STAFF_DISPLAY_STATUS_INITIALIZED,
} from "@/utils/staff";

import type {
  StaffFilters,
  StaffRoleFilter,
  StaffStatusFilter,
} from "./ownerStaffTypes";

type OwnerStaffFiltersProps = {
  branches: Branch[];
  draftFilters: StaffFilters;
  isBranchLocked: boolean;
  onApplyFilters: (event: FormEvent<HTMLFormElement>) => void;
  onDraftFiltersChange: (filters: StaffFilters) => void;
};

export function OwnerStaffFilters({
  branches,
  draftFilters,
  isBranchLocked,
  onApplyFilters,
  onDraftFiltersChange,
}: OwnerStaffFiltersProps) {
  return (
    <Card padding="lg" title={staffTexts.ownerStaff.filterTitle}>
      <form className="grid gap-4 lg:grid-cols-3" onSubmit={onApplyFilters}>
        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {staffTexts.ownerStaff.searchLabel}
          </span>
          <Input
            className="mt-2"
            placeholder={staffTexts.ownerStaff.searchPlaceholder}
            value={draftFilters.search}
            onChange={(event) =>
              onDraftFiltersChange({
                ...draftFilters,
                search: event.target.value,
              })
            }
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {staffTexts.ownerStaff.roleLabel}
          </span>
          <Select
            className="mt-2"
            value={draftFilters.role}
            onChange={(event) =>
              onDraftFiltersChange({
                ...draftFilters,
                role: event.target.value as StaffRoleFilter,
              })
            }
          >
            <option value={ALL_FILTER_VALUE}>
              {staffTexts.ownerStaff.allRolesOption}
            </option>
            {STAFF_ROLES.map((staffRole) => (
              <option key={staffRole} value={staffRole}>
                {staffTexts.ownerStaff.roles[staffRole]}
              </option>
            ))}
          </Select>
        </label>

        {!isBranchLocked ? (
          <label className="block">
            <span className="text-sm font-medium text-gray-1000">
              {staffTexts.ownerStaff.branchLabel}
            </span>
            <Select
              className="mt-2"
              value={draftFilters.branchId}
              onChange={(event) =>
                onDraftFiltersChange({
                  ...draftFilters,
                  branchId: event.target.value,
                })
              }
            >
              <option value={ALL_FILTER_VALUE}>
                {staffTexts.ownerStaff.allBranchesOption}
              </option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {staffTexts.ownerStaff.statusLabel}
          </span>
          <Select
            className="mt-2"
            value={draftFilters.status}
            onChange={(event) =>
              onDraftFiltersChange({
                ...draftFilters,
                status: event.target.value as StaffStatusFilter,
              })
            }
          >
            <option value={ALL_FILTER_VALUE}>
              {staffTexts.ownerStaff.allStatusesOption}
            </option>
            <option value={STAFF_DISPLAY_STATUS_INITIALIZED}>
              {staffTexts.ownerStaff.statuses.initialized}
            </option>
            <option value={STAFF_DISPLAY_STATUS_ACTIVE}>
              {staffTexts.ownerStaff.statuses.active}
            </option>
          </Select>
        </label>

        <div className="flex items-end justify-end lg:col-span-3">
          <Button type="submit">{staffTexts.ownerStaff.applyFilters}</Button>
        </div>
      </form>
    </Card>
  );
}

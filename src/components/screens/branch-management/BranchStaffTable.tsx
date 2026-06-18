import {
  Badge,
  Button,
  Card,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Checkbox,
} from "@/components/global";
import { UI_VARIANT_SECONDARY } from "@/constants/common";
import { branchTexts, staffTexts } from "@/constants/texts";
import type { Staff } from "@/types";
import { formatDisplayDate } from "@/utils/common";
import { getStaffDisplayStatus } from "@/utils/staff";

import {
  STAFF_ROLE_BADGE_VARIANTS,
  STAFF_STATUS_BADGE_VARIANTS,
} from "../owner-staff/ownerStaffTypes";

type BranchStaffTableProps = {
  isCreateMode: boolean;
  isLoading: boolean;
  staff: Staff[];
  selectedStaffIds: string[];
  onSelectedStaffIdsChange: (ids: string[]) => void;
  onTransfer: () => void;
};

export function BranchStaffTable({
  isCreateMode,
  isLoading,
  staff,
  selectedStaffIds,
  onSelectedStaffIdsChange,
  onTransfer,
}: BranchStaffTableProps) {
  return (
    <Card
      padding="lg"
      title={branchTexts.ownerBranches.staffTitle}
      action={
        <Tooltip content={branchTexts.ownerBranches.transferStaff}>
          <Button
            disabled={selectedStaffIds.length === 0}
            type="button"
            variant={UI_VARIANT_SECONDARY}
            onClick={onTransfer}
          >
            {branchTexts.ownerBranches.transferStaff}
          </Button>
        </Tooltip>
      }
    >
      {isCreateMode ? (
        <EmptyState title={branchTexts.ownerBranches.saveBeforeStaff} />
      ) : null}

      {!isCreateMode && isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-12 w-full" key={index} />
          ))}
        </div>
      ) : null}

      {!isCreateMode && !isLoading && staff.length === 0 ? (
        <EmptyState title={branchTexts.ownerBranches.staffEmpty} />
      ) : null}

      {!isCreateMode && !isLoading && staff.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-400">
          <Table>
            <TableHead>
              <TableRow>
                <th className="w-12 px-3 py-3 text-center">
                  <Checkbox
                    aria-label={branchTexts.ownerBranches.transferStaff}
                    checked={staff.length > 0 && selectedStaffIds.length === staff.length}
                    onChange={(event) =>
                      onSelectedStaffIdsChange(
                        event.target.checked ? staff.map((item) => item.id) : [],
                      )
                    }
                  />
                </th>
                <th className="w-10 px-2 py-3 text-center font-semibold text-gray-1000">
                  {branchTexts.ownerBranches.staffTable.index}
                </th>
                <th className="min-w-48 px-4 py-3 text-left font-semibold text-gray-1000">
                  {branchTexts.ownerBranches.staffTable.username}
                </th>
                <th className="min-w-36 px-4 py-3 text-left font-semibold text-gray-1000">
                  {branchTexts.ownerBranches.staffTable.role}
                </th>
                <th className="min-w-36 px-4 py-3 text-left font-semibold text-gray-1000">
                  {branchTexts.ownerBranches.staffTable.status}
                </th>
                <th className="min-w-36 px-4 py-3 text-left font-semibold text-gray-1000">
                  {branchTexts.ownerBranches.staffTable.createdAt}
                </th>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((staffMember, index) => {
                const status = getStaffDisplayStatus(staffMember);

                return (
                  <TableRow key={staffMember.id}>
                    <TableCell className="w-12 text-center">
                      <Checkbox
                        aria-label={staffMember.username}
                        checked={selectedStaffIds.includes(staffMember.id)}
                        onChange={(event) =>
                          onSelectedStaffIdsChange(
                            event.target.checked
                              ? [...selectedStaffIds, staffMember.id]
                              : selectedStaffIds.filter((id) => id !== staffMember.id),
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="w-10 px-2 text-center">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {staffMember.username}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STAFF_ROLE_BADGE_VARIANTS[staffMember.role]}>
                        {staffTexts.ownerStaff.roles[staffMember.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STAFF_STATUS_BADGE_VARIANTS[status]}>
                        {staffTexts.ownerStaff.statuses[status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDisplayDate(staffMember.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </Card>
  );
}

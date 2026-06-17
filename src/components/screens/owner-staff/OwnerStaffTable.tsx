import { Edit2, Plus, Trash2 } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  Error as FeedbackError,
  Pagination,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@/components/global";
import { staffTexts } from "@/constants/texts";
import type { Staff } from "@/types";
import { formatDisplayDate } from "@/utils/common";
import {
  formatStaffPageSummary,
  getStaffDisplayStatus,
} from "@/utils/staff";

import {
  STAFF_ROLE_BADGE_VARIANTS,
  STAFF_STATUS_BADGE_VARIANTS,
} from "./ownerStaffTypes";

type OwnerStaffTableProps = {
  branchesError: Error | null;
  currentPage: number;
  isLoading: boolean;
  onCreate: () => void;
  onDelete: (staffMember: Staff) => void;
  onEdit: (staffMember: Staff) => void;
  onPageChange: (page: number) => void;
  onView: (staffMember: Staff) => void;
  pageEnd: number;
  pageStart: number;
  pageStartIndex: number;
  staff: Staff[];
  staffError: Error | null;
  totalCount: number;
  totalPages: number;
};

export function OwnerStaffTable({
  branchesError,
  currentPage,
  isLoading,
  onCreate,
  onDelete,
  onEdit,
  onPageChange,
  onView,
  pageEnd,
  pageStart,
  pageStartIndex,
  staff,
  staffError,
  totalCount,
  totalPages,
}: OwnerStaffTableProps) {
  const errorMessage =
    staffError?.message ??
    branchesError?.message ??
    staffTexts.ownerStaff.errors.generic;

  return (
    <Card
      padding="lg"
      title={staffTexts.ownerStaff.listTitle}
      action={
        <Button
          icon={<Plus className="size-4" aria-hidden="true" />}
          type="button"
          onClick={onCreate}
        >
          {staffTexts.ownerStaff.createAction}
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {staffError || branchesError ? (
        <FeedbackError message={errorMessage} />
      ) : null}

      {!isLoading && !staffError && !branchesError && totalCount === 0 ? (
        <EmptyState title={staffTexts.ownerStaff.empty} />
      ) : null}

      {!isLoading && !staffError && !branchesError && totalCount > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-400">
          <Table>
            <TableHead>
              <TableRow>
                <th className="w-16 px-4 py-3 text-left font-semibold text-gray-1000">
                  {staffTexts.ownerStaff.table.index}
                </th>
                <th className="min-w-48 px-4 py-3 text-left font-semibold text-gray-1000">
                  {staffTexts.ownerStaff.table.username}
                </th>
                <th className="min-w-36 px-4 py-3 text-left font-semibold text-gray-1000">
                  {staffTexts.ownerStaff.table.role}
                </th>
                <th className="min-w-44 px-4 py-3 text-left font-semibold text-gray-1000">
                  {staffTexts.ownerStaff.table.branch}
                </th>
                <th className="min-w-32 px-4 py-3 text-left font-semibold text-gray-1000">
                  {staffTexts.ownerStaff.table.status}
                </th>
                <th className="min-w-36 px-4 py-3 text-left font-semibold text-gray-1000">
                  {staffTexts.ownerStaff.table.createdAt}
                </th>
                <th className="w-32 px-4 py-3 text-right font-semibold text-gray-1000">
                  {staffTexts.ownerStaff.table.actions}
                </th>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((staffMember, index) => {
                const displayStatus = getStaffDisplayStatus(staffMember);

                return (
                  <TableRow key={staffMember.id}>
                    <TableCell>{pageStartIndex + index + 1}</TableCell>
                    <TableCell>
                      <button
                        className="min-h-11 cursor-pointer text-left font-bold text-gray-1000 underline-offset-4 hover:underline"
                        type="button"
                        onClick={() => onView(staffMember)}
                      >
                        {staffMember.username}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge
                        size="sm"
                        variant={STAFF_ROLE_BADGE_VARIANTS[staffMember.role]}
                      >
                        {staffTexts.ownerStaff.roles[staffMember.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {staffMember.branch?.name ??
                        staffTexts.ownerStaff.branchEmpty}
                    </TableCell>
                    <TableCell>
                      <Badge
                        size="sm"
                        variant={STAFF_STATUS_BADGE_VARIANTS[displayStatus]}
                      >
                        {staffTexts.ownerStaff.statuses[displayStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDisplayDate(staffMember.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Tooltip content={staffTexts.ownerStaff.edit}>
                          <Button
                            aria-label={staffTexts.ownerStaff.edit}
                            className="size-10 px-0"
                            icon={
                              <Edit2 className="size-4" aria-hidden="true" />
                            }
                            type="button"
                            variant="secondary"
                            onClick={() => onEdit(staffMember)}
                          />
                        </Tooltip>
                        <Tooltip content={staffTexts.ownerStaff.delete}>
                          <Button
                            aria-label={staffTexts.ownerStaff.delete}
                            className="size-10 px-0"
                            icon={
                              <Trash2 className="size-4" aria-hidden="true" />
                            }
                            type="button"
                            variant="danger"
                            onClick={() => onDelete(staffMember)}
                          />
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {totalCount > 0 ? (
        <div className="mt-4 flex flex-col gap-3 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <p>{formatStaffPageSummary(pageStart, pageEnd, totalCount)}</p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      ) : null}
    </Card>
  );
}

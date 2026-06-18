import { Edit2, Plus, Power } from "lucide-react";
import Link from "next/link";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  Error as FeedbackError,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@/components/global";
import {
  BRANCH_STATUS_ACTIVE,
  BRANCH_STATUS_INACTIVE,
  UI_VARIANT_DANGER,
  UI_VARIANT_SECONDARY,
} from "@/constants/common";
import type { BranchStatusValue } from "@/constants/common";
import { branchTexts } from "@/constants/texts";
import { ROUTES } from "@/constants/routes";
import type { Branch } from "@/types";
import { formatDisplayDate } from "@/utils/common";

type BranchTableProps = {
  branches: Branch[];
  error: Error | null;
  hasFilters: boolean;
  isLoading: boolean;
  onCreate: () => void;
  onStatusChange: (branch: Branch, status: BranchStatusValue) => void;
};

export function BranchTable({ branches, error, hasFilters, isLoading, onCreate, onStatusChange }: BranchTableProps) {
  return (
    <Card
      padding="lg"
      title={branchTexts.ownerBranches.listTitle}
      action={
        <Button icon={<Plus className="size-4" aria-hidden="true" />} type="button" onClick={onCreate}>
          {branchTexts.ownerBranches.createAction}
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
        </div>
      ) : null}

      {error ? <FeedbackError message={error.message || branchTexts.ownerBranches.errors.generic} /> : null}

      {!isLoading && !error && branches.length === 0 ? (
        <EmptyState title={hasFilters ? branchTexts.ownerBranches.emptySearch : branchTexts.ownerBranches.empty} />
      ) : null}

      {!isLoading && !error && branches.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-400">
          <Table>
            <TableHead>
              <TableRow>
                <th className="w-10 px-2 py-3 text-center font-semibold text-gray-1000">{branchTexts.ownerBranches.table.index}</th>
                <th className="min-w-48 px-4 py-3 text-left font-semibold text-gray-1000">{branchTexts.ownerBranches.table.name}</th>
                <th className="min-w-64 px-4 py-3 text-left font-semibold text-gray-1000">{branchTexts.ownerBranches.table.address}</th>
                <th className="min-w-44 px-4 py-3 text-left font-semibold text-gray-1000">{branchTexts.ownerBranches.table.manager}</th>
                <th className="min-w-40 px-4 py-3 text-left font-semibold text-gray-1000">{branchTexts.ownerBranches.table.status}</th>
                <th className="w-28 px-3 py-3 text-left font-semibold text-gray-1000">{branchTexts.ownerBranches.table.createdAt}</th>
                <th className="w-28 px-3 py-3 text-right font-semibold text-gray-1000">{branchTexts.ownerBranches.table.actions}</th>
              </TableRow>
            </TableHead>
            <TableBody>
              {branches.map((branch, index) => {
                const status = branch.status ?? BRANCH_STATUS_ACTIVE;
                const isActive = status === BRANCH_STATUS_ACTIVE;
                const statusActionLabel = isActive ? branchTexts.ownerBranches.deactivate : branchTexts.ownerBranches.activate;

                return (
                  <TableRow key={branch.id}>
                    <TableCell className="w-10 px-2 text-center">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <Link className="text-blue-900 hover:underline" href={ROUTES.ownerBranchDetail(branch.id)}>
                        {branch.name}
                      </Link>
                    </TableCell>
                    <TableCell>{branch.address}</TableCell>
                    <TableCell>{branch.manager?.username ?? branchTexts.ownerBranches.unassignedManager}</TableCell>
                    <TableCell>
                      <Badge variant={status === BRANCH_STATUS_INACTIVE ? "default" : "success"}>
                        {status === BRANCH_STATUS_INACTIVE ? branchTexts.ownerBranches.statuses.inactive : branchTexts.ownerBranches.statuses.active}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-28 px-3 whitespace-nowrap">{formatDisplayDate(branch.createdAt)}</TableCell>
                    <TableCell className="w-28 px-3">
                      <div className="flex justify-end gap-2">
                        <Tooltip content={branchTexts.ownerBranches.edit}>
                          <Link
                            aria-label={branchTexts.ownerBranches.edit}
                            className="inline-flex size-10 min-h-11 items-center justify-center rounded-md bg-gray-200 px-0 text-gray-1000 hover:bg-gray-300"
                            href={ROUTES.ownerBranchEdit(branch.id)}
                          >
                            <Edit2 className="size-4" aria-hidden="true" />
                          </Link>
                        </Tooltip>
                        <Tooltip content={statusActionLabel}>
                          <Button
                            aria-label={statusActionLabel}
                            className="size-10 px-0"
                            icon={<Power className="size-4" aria-hidden="true" />}
                            type="button"
                            variant={isActive ? UI_VARIANT_DANGER : UI_VARIANT_SECONDARY}
                            onClick={() =>
                              onStatusChange(
                                branch,
                                isActive ? BRANCH_STATUS_INACTIVE : BRANCH_STATUS_ACTIVE,
                              )
                            }
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
    </Card>
  );
}

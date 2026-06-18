import { CopyPlus, Edit2, Plus, Trash2 } from "lucide-react";

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
import {
  CATALOG_STATUS_DELETED,
  SERVICE_SCOPE_BRANCH,
  SERVICE_SCOPE_SHOP,
  type CatalogStatusValue,
  UI_VARIANT_DANGER,
  UI_VARIANT_SECONDARY,
  type ServiceScopeValue,
} from "@/constants/common";
import { comboTexts } from "@/constants/texts";
import type { Combo } from "@/types";
import { formatDisplayDate, formatVndPrice } from "@/utils/common";

import { COMBO_SCOPE_BADGE_VARIANTS } from "./comboManagementTypes";

type ComboTableProps = {
  combos: Combo[];
  catalogStatus: CatalogStatusValue;
  currentPage: number;
  error: Error | null;
  isLoading: boolean;
  onCreate: () => void;
  onDelete: (combo: Combo) => void;
  onDuplicate: (combo: Combo) => void;
  onEdit: (combo: Combo) => void;
  onPageChange: (page: number) => void;
  pageEnd: number;
  pageStart: number;
  pageStartIndex: number;
  totalCount: number;
  totalPages: number;
};

function formatComboPageSummary(
  pageStart: number,
  pageEnd: number,
  total: number,
) {
  return `${pageStart}-${pageEnd} / ${total}`;
}

function getScopeValue(combo: Combo): ServiceScopeValue {
  return combo.scope ?? (combo.branchId ? SERVICE_SCOPE_BRANCH : SERVICE_SCOPE_SHOP);
}

function getScopeLabel(combo: Combo) {
  if (combo.branch) {
    return combo.branch.name;
  }

  if (combo.scope === SERVICE_SCOPE_BRANCH || combo.branchId) {
    return comboTexts.ownerCombos.scopes.branch;
  }

  return comboTexts.ownerCombos.scopes.shop;
}

function getCreatorLabel(combo: Combo) {
  return combo.creator?.username ?? comboTexts.ownerCombos.scopes.unknown;
}

export function ComboTable({
  combos,
  catalogStatus,
  currentPage,
  error,
  isLoading,
  onCreate,
  onDelete,
  onDuplicate,
  onEdit,
  onPageChange,
  pageEnd,
  pageStart,
  pageStartIndex,
  totalCount,
  totalPages,
}: ComboTableProps) {
  const isDeletedTab = catalogStatus === CATALOG_STATUS_DELETED;

  return (
    <Card
      action={
        isDeletedTab ? null : (
          <Button
            icon={<Plus className="size-4" aria-hidden="true" />}
            type="button"
            onClick={onCreate}
          >
            {comboTexts.ownerCombos.createAction}
          </Button>
        )
      }
      padding="lg"
      title={comboTexts.ownerCombos.listTitle}
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : null}

      {error ? (
        <FeedbackError
          message={error.message ?? comboTexts.ownerCombos.errors.generic}
        />
      ) : null}

      {!isLoading && !error && totalCount === 0 ? (
        <EmptyState
          title={
            isDeletedTab
              ? comboTexts.ownerCombos.emptyDeleted
              : comboTexts.ownerCombos.empty
          }
        />
      ) : null}

      {!isLoading && !error && totalCount > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-400">
          <Table>
            <TableHead>
              <TableRow>
                <th className="w-10 px-2 py-3 text-center font-semibold text-gray-1000">
                  {comboTexts.ownerCombos.table.index}
                </th>
                <th className="min-w-56 px-4 py-3 text-left font-semibold text-gray-1000">
                  {comboTexts.ownerCombos.table.name}
                </th>
                <th className="min-w-32 px-4 py-3 text-left font-semibold text-gray-1000">
                  {comboTexts.ownerCombos.table.price}
                </th>
                <th className="min-w-48 px-4 py-3 text-left font-semibold text-gray-1000">
                  {comboTexts.ownerCombos.table.services}
                </th>
                <th className="min-w-36 px-4 py-3 text-left font-semibold text-gray-1000">
                  {comboTexts.ownerCombos.table.createdAt}
                </th>
                <th className="min-w-44 px-4 py-3 text-left font-semibold text-gray-1000">
                  {comboTexts.ownerCombos.table.scope}
                </th>
                <th className="w-40 px-3 py-3 text-right font-semibold text-gray-1000">
                  {comboTexts.ownerCombos.table.actions}
                </th>
              </TableRow>
            </TableHead>
            <TableBody>
              {combos.map((combo, index) => {
                const scope = getScopeValue(combo);

                return (
                  <TableRow key={combo.id}>
                    <TableCell className="px-2 text-center">
                      {pageStartIndex + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-bold text-gray-1000">
                          {combo.name}
                        </p>
                        <p className="text-sm text-gray-700">
                          {combo.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{formatVndPrice(combo.price)}</TableCell>
                    <TableCell>
                      <ul className="space-y-1">
                        {combo.services.map((service) => (
                          <li
                            key={service.id}
                            className="flex items-start gap-2 text-sm font-medium text-gray-1000"
                          >
                            <span
                              className="mt-2 size-1.5 shrink-0 rounded-full bg-gray-1000"
                              aria-hidden="true"
                            />
                            <span>{service.name}</span>
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>{formatDisplayDate(combo.createdAt)}</p>
                        <p className="text-sm text-gray-700">
                          {comboTexts.ownerCombos.creatorLabel}:{" "}
                          {getCreatorLabel(combo)}
                        </p>
                        {combo.deletedAt ? (
                          <p className="text-sm text-gray-700">
                            {comboTexts.ownerCombos.deletedAtLabel}:{" "}
                            {formatDisplayDate(combo.deletedAt)}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        size="sm"
                        variant={COMBO_SCOPE_BADGE_VARIANTS[scope]}
                      >
                        {getScopeLabel(combo)}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-40 px-3">
                      <div className="flex justify-end gap-2">
                        {isDeletedTab ? null : (
                          <Tooltip
                            content={
                              combo.isUsedInVisit
                                ? comboTexts.ownerCombos.comboInUseEditBlocked
                                : comboTexts.ownerCombos.edit
                            }
                          >
                            <Button
                              aria-label={comboTexts.ownerCombos.edit}
                              className="size-10 px-0"
                              disabled={
                                combo.canEdit === false || combo.isUsedInVisit
                              }
                              icon={
                                <Edit2 className="size-4" aria-hidden="true" />
                              }
                              type="button"
                              variant={UI_VARIANT_SECONDARY}
                              onClick={() => onEdit(combo)}
                            />
                          </Tooltip>
                        )}
                        <Tooltip content={comboTexts.ownerCombos.duplicate}>
                          <Button
                            aria-label={comboTexts.ownerCombos.duplicate}
                            className="size-10 px-0"
                            icon={
                              <CopyPlus
                                className="size-4"
                                aria-hidden="true"
                              />
                            }
                            type="button"
                            variant={UI_VARIANT_SECONDARY}
                            onClick={() => onDuplicate(combo)}
                          />
                        </Tooltip>
                        {isDeletedTab ? null : (
                          <Tooltip content={comboTexts.ownerCombos.delete}>
                            <Button
                              aria-label={comboTexts.ownerCombos.delete}
                              className="size-10 px-0"
                              disabled={combo.canDelete === false}
                              icon={
                                <Trash2 className="size-4" aria-hidden="true" />
                              }
                              type="button"
                              variant={UI_VARIANT_DANGER}
                              onClick={() => onDelete(combo)}
                            />
                          </Tooltip>
                        )}
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
          <p>{formatComboPageSummary(pageStart, pageEnd, totalCount)}</p>
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

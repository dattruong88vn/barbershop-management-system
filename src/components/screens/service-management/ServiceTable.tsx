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
import {
  CATALOG_STATUS_DELETED,
  type CatalogStatusValue,
  UI_VARIANT_DANGER,
  UI_VARIANT_SECONDARY,
} from "@/constants/common";
import { serviceTexts } from "@/constants/texts";
import type { Service } from "@/types";
import { formatDisplayDate, formatVndPrice } from "@/utils/common";
import { getStaffDisplayName } from "@/utils/staff";

import {
  SERVICE_RESPONSIBLE_ROLE_BADGE_VARIANTS,
  SERVICE_SCOPE_BADGE_VARIANTS,
} from "./serviceManagementTypes";

type ServiceTableProps = {
  currentPage: number;
  catalogStatus: CatalogStatusValue;
  error: Error | null;
  isLoading: boolean;
  onCreate: () => void;
  onDelete: (service: Service) => void;
  onEdit: (service: Service) => void;
  onPageChange: (page: number) => void;
  pageEnd: number;
  pageStart: number;
  pageStartIndex: number;
  services: Service[];
  totalCount: number;
  totalPages: number;
};

function formatServicePageSummary(
  pageStart: number,
  pageEnd: number,
  total: number,
) {
  return `${pageStart}-${pageEnd} / ${total}`;
}

function getScopeLabel(service: Service) {
  if (service.branch) {
    return service.branch.name;
  }

  return serviceTexts.ownerServices.scopes.shop;
}

function getServiceNameClassName(service: Service) {
  return service.isHaircut ? "text-blue-900" : "text-amber-900";
}

export function ServiceTable({
  currentPage,
  catalogStatus,
  error,
  isLoading,
  onCreate,
  onDelete,
  onEdit,
  onPageChange,
  pageEnd,
  pageStart,
  pageStartIndex,
  services,
  totalCount,
  totalPages,
}: ServiceTableProps) {
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
            {serviceTexts.ownerServices.createAction}
          </Button>
        )
      }
      padding="lg"
      title={serviceTexts.ownerServices.listTitle}
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
          message={error.message ?? serviceTexts.ownerServices.errors.generic}
        />
      ) : null}

      {!isLoading && !error && totalCount === 0 ? (
        <EmptyState
          title={
            isDeletedTab
              ? serviceTexts.ownerServices.emptyDeleted
              : serviceTexts.ownerServices.empty
          }
        />
      ) : null}

      {!isLoading && !error && totalCount > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-400">
          <Table>
            <TableHead>
              <TableRow>
                <th className="w-10 px-2 py-3 text-center font-semibold text-gray-1000">
                  {serviceTexts.ownerServices.table.index}
                </th>
                <th className="min-w-56 px-4 py-3 text-left font-semibold text-gray-1000">
                  {serviceTexts.ownerServices.table.name}
                </th>
                <th className="min-w-32 px-4 py-3 text-left font-semibold text-gray-1000">
                  {serviceTexts.ownerServices.table.price}
                </th>
                <th className="min-w-36 px-4 py-3 text-left font-semibold text-gray-1000">
                  {serviceTexts.ownerServices.table.responsibleRole}
                </th>
                <th className="min-w-44 px-4 py-3 text-left font-semibold text-gray-1000">
                  {serviceTexts.ownerServices.table.scope}
                </th>
                <th className="min-w-36 px-4 py-3 text-left font-semibold text-gray-1000">
                  {serviceTexts.ownerServices.table.creator}
                </th>
                <th className="min-w-36 px-4 py-3 text-left font-semibold text-gray-1000">
                  {serviceTexts.ownerServices.table.createdAt}
                </th>
                {isDeletedTab ? null : (
                  <th className="w-28 px-3 py-3 text-right font-semibold text-gray-1000">
                    {serviceTexts.ownerServices.table.actions}
                  </th>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service, index) => (
                <TableRow key={service.id}>
                  <TableCell className="px-2 text-center">
                    {pageStartIndex + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-bold ${getServiceNameClassName(service)}`}
                      >
                        {service.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatVndPrice(service.price)}</TableCell>
                  <TableCell>
                    <Badge
                      size="sm"
                      variant={
                        SERVICE_RESPONSIBLE_ROLE_BADGE_VARIANTS[
                          service.responsibleRole
                        ]
                      }
                    >
                      {
                        serviceTexts.ownerServices.responsibleRoles[
                          service.responsibleRole
                        ]
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      size="sm"
                      variant={SERVICE_SCOPE_BADGE_VARIANTS[service.scope]}
                    >
                      {getScopeLabel(service)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStaffDisplayName(service.creator)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p>{formatDisplayDate(service.createdAt)}</p>
                      {service.deletedAt ? (
                        <p className="text-sm text-gray-700">
                          {serviceTexts.ownerServices.deletedAtLabel}:{" "}
                          {formatDisplayDate(service.deletedAt)}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  {isDeletedTab ? null : (
                    <TableCell className="w-28 px-3">
                      <div className="flex justify-end gap-2">
                        <Tooltip content={serviceTexts.ownerServices.edit}>
                          <Button
                            aria-label={serviceTexts.ownerServices.edit}
                            className="size-10 px-0"
                            disabled={!service.canEdit}
                            icon={<Edit2 className="size-4" aria-hidden="true" />}
                            type="button"
                            variant={UI_VARIANT_SECONDARY}
                            onClick={() => onEdit(service)}
                          />
                        </Tooltip>
                        <Tooltip content={serviceTexts.ownerServices.delete}>
                          <Button
                            aria-label={serviceTexts.ownerServices.delete}
                            className="size-10 px-0"
                            disabled={!service.canDelete}
                            icon={
                              <Trash2 className="size-4" aria-hidden="true" />
                            }
                            type="button"
                            variant={UI_VARIANT_DANGER}
                            onClick={() => onDelete(service)}
                          />
                        </Tooltip>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {totalCount > 0 ? (
        <div className="mt-4 flex flex-col gap-3 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <p>{formatServicePageSummary(pageStart, pageEnd, totalCount)}</p>
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

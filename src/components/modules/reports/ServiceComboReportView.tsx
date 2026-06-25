"use client";

import { useMemo, useState } from "react";
import { BarChart3, Eye } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  Button,
  Card,
  EmptyState,
  Heading,
  InlineAlert,
  Modal,
  SearchInput,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
} from "@/components/global";
import {
  REPORT_ITEM_TAB_COMBO,
  REPORT_ITEM_TAB_SERVICE,
  REPORT_USAGE_SORT_ASC,
  REPORT_USAGE_SORT_DESC,
  SERVICE_RESPONSIBLE_ROLE_BARBER,
  SERVICE_RESPONSIBLE_ROLE_SKINNER,
  USER_ROLE_OWNER,
  type ReportItemTabValue,
  type ReportUsageSortValue,
  type ServiceResponsibleRoleValue,
} from "@/constants/common";
import { designSystemTexts, reportTexts } from "@/constants/texts";
import { useBranches } from "@/hooks/useBranches";
import {
  useServiceComboReport,
  useServiceComboReportDetails,
} from "@/hooks/useServiceComboReport";
import { cn } from "@/lib/utils";
import type {
  ReportPaginationMeta,
  ServiceComboReportDetail,
  ServiceComboReportRow,
} from "@/types";
import { formatDisplayDateTime } from "@/utils/common";
import {
  getCurrentMonthReportDateRange,
  getReportDateKey,
} from "@/utils/reports";

import { ReportDateRangeFilter } from "./ReportDateRangeFilter";
import { ReportMetaBar } from "./ReportMetaBar";

const ALL_FILTER_VALUE = "all";
const DETAIL_PAGE_SIZE = 10;

type ServiceComboReportFilterState = {
  branchId: string;
  fromDate: string;
  responsibleRole: string;
  search: string;
  sort: ReportUsageSortValue;
  tab: ReportItemTabValue;
  toDate: string;
};

function HeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "border-r border-gray-400 px-4 py-3 text-left font-semibold text-gray-1000 last:border-r-0",
        className,
      )}
      scope="col"
    >
      {children}
    </th>
  );
}

function formatDateTime(value: string | null) {
  return value ? formatDisplayDateTime(value) : "-";
}

function getRoleLabel(role: ServiceResponsibleRoleValue | null) {
  return role
    ? reportTexts.roles[role]
    : reportTexts.serviceComboReport.unknownRole;
}

function getDetailPageSummary(pagination: ReportPaginationMeta) {
  return reportTexts.serviceComboReport.detailPageSummary
    .replace("{page}", String(pagination.page))
    .replace("{totalPages}", String(pagination.totalPages))
    .replace("{total}", String(pagination.total));
}

function ServiceComboReportDetails({
  details,
  showRole,
}: {
  details: ServiceComboReportDetail[];
  showRole: boolean;
}) {
  if (!details.length) {
    return (
      <EmptyState icon={BarChart3} text={reportTexts.serviceComboReport.empty} />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-400">
      <Table>
        <TableHead>
          <TableRow>
            <HeaderCell>
              {reportTexts.serviceComboReport.detailColumns.visit}
            </HeaderCell>
            <HeaderCell>
              {reportTexts.serviceComboReport.detailColumns.completedAt}
            </HeaderCell>
            <HeaderCell>
              {reportTexts.serviceComboReport.detailColumns.branch}
            </HeaderCell>
            <HeaderCell>
              {reportTexts.serviceComboReport.detailColumns.customer}
            </HeaderCell>
            <HeaderCell>
              {reportTexts.serviceComboReport.detailColumns.item}
            </HeaderCell>
            {showRole ? (
              <HeaderCell>
                {reportTexts.serviceComboReport.detailColumns.responsibleRole}
              </HeaderCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {details.map((detail) => (
            <TableRow key={`${detail.visitId}-${detail.itemName}`}>
              <TableCell className="font-mono text-xs">
                {detail.visitId.slice(0, 8)}
              </TableCell>
              <TableCell>{formatDateTime(detail.completedAt)}</TableCell>
              <TableCell>{detail.branchName}</TableCell>
              <TableCell>{detail.customerName}</TableCell>
              <TableCell>{detail.itemName}</TableCell>
              {showRole ? (
                <TableCell>{getRoleLabel(detail.responsibleRole)}</TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ServiceComboReportView({
  initialTab = REPORT_ITEM_TAB_SERVICE,
}: {
  initialTab?: ReportItemTabValue;
}) {
  const { data: session } = useSession();
  const isOwner = session?.user.role === USER_ROLE_OWNER;
  const initialDateRange = useMemo(() => getCurrentMonthReportDateRange(), []);
  const initialFilters = useMemo<
    Record<ReportItemTabValue, ServiceComboReportFilterState>
  >(
    () => ({
      [REPORT_ITEM_TAB_COMBO]: {
        branchId: ALL_FILTER_VALUE,
        fromDate: initialDateRange.fromDate,
        responsibleRole: ALL_FILTER_VALUE,
        search: "",
        sort: REPORT_USAGE_SORT_DESC,
        tab: REPORT_ITEM_TAB_COMBO,
        toDate: initialDateRange.toDate,
      },
      [REPORT_ITEM_TAB_SERVICE]: {
        branchId: ALL_FILTER_VALUE,
        fromDate: initialDateRange.fromDate,
        responsibleRole: ALL_FILTER_VALUE,
        search: "",
        sort: REPORT_USAGE_SORT_DESC,
        tab: REPORT_ITEM_TAB_SERVICE,
        toDate: initialDateRange.toDate,
      },
    }),
    [initialDateRange.fromDate, initialDateRange.toDate],
  );
  const [tab, setTab] = useState<ReportItemTabValue>(initialTab);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [selectedRow, setSelectedRow] =
    useState<ServiceComboReportRow | null>(null);
  const [detailPage, setDetailPage] = useState(1);
  const draftFilter = draftFilters[tab];
  const appliedFilter = appliedFilters[tab];
  const reportFilter = {
    fromDate: appliedFilter.fromDate,
    tab: appliedFilter.tab,
    toDate: appliedFilter.toDate,
    ...(isOwner && appliedFilter.branchId !== ALL_FILTER_VALUE
      ? { branchId: appliedFilter.branchId }
      : {}),
    ...(appliedFilter.tab === REPORT_ITEM_TAB_SERVICE &&
    appliedFilter.responsibleRole !== ALL_FILTER_VALUE
      ? {
          responsibleRole:
            appliedFilter.responsibleRole as ServiceResponsibleRoleValue,
        }
      : {}),
    ...(appliedFilter.search ? { search: appliedFilter.search } : {}),
    sort: appliedFilter.sort,
  };
  const { branches, isLoading: isLoadingBranches } = useBranches(isOwner);
  const { error, isLoading, report } = useServiceComboReport(reportFilter);
  const detailFilter = {
    ...reportFilter,
    itemId: selectedRow?.itemId ?? "",
    page: detailPage,
    pageSize: DETAIL_PAGE_SIZE,
  };
  const {
    error: detailError,
    isFetching: isFetchingDetails,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
    report: detailReport,
  } = useServiceComboReportDetails(detailFilter, Boolean(selectedRow));
  const shouldShowInitialSkeleton = isLoading && !report;
  const shouldShowTableSkeleton = isLoadingBranches && !report;
  const currentBranchName =
    report?.branchName ??
    (isOwner && appliedFilter.branchId !== ALL_FILTER_VALUE
      ? branches.find((branch) => branch.id === appliedFilter.branchId)?.name
      : null) ??
    reportTexts.serviceComboReport.allBranches;
  const currentDetailReport =
    detailReport &&
    detailReport.itemId === selectedRow?.itemId &&
    detailReport.tab === appliedFilter.tab
      ? detailReport
      : null;
  const shouldShowDetailSkeleton =
    isLoadingDetails || (isFetchingDetails && !currentDetailReport);
  const maximumDate = getReportDateKey();
  const isServiceTab = tab === REPORT_ITEM_TAB_SERVICE;
  const isAppliedServiceTab = appliedFilter.tab === REPORT_ITEM_TAB_SERVICE;

  function updateDraftFilter(
    updater: (
      currentFilter: ServiceComboReportFilterState,
    ) => ServiceComboReportFilterState,
  ) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [tab]: updater(currentFilters[tab]),
    }));
  }

  function handleFromDateChange(nextFromDate: string) {
    updateDraftFilter((currentFilter) => ({
      ...currentFilter,
      fromDate: nextFromDate,
      toDate:
        nextFromDate > currentFilter.toDate
          ? nextFromDate
          : currentFilter.toDate,
    }));
  }

  function handleToDateChange(nextToDate: string) {
    updateDraftFilter((currentFilter) => ({
      ...currentFilter,
      fromDate:
        nextToDate < currentFilter.fromDate
          ? nextToDate
          : currentFilter.fromDate,
      toDate: nextToDate,
    }));
  }

  function handleTabChange(nextTab: string) {
    if (nextTab !== REPORT_ITEM_TAB_SERVICE && nextTab !== REPORT_ITEM_TAB_COMBO) {
      return;
    }

    setTab(nextTab);
    setSelectedRow(null);
    setDetailPage(1);
  }

  function handleFiltersApply() {
    setAppliedFilters((currentFilters) => ({
      ...currentFilters,
      [tab]: {
        ...draftFilters[tab],
        search: draftFilters[tab].search.trim(),
      },
    }));
    setSelectedRow(null);
    setDetailPage(1);
  }

  function handleDetailsOpen(row: ServiceComboReportRow) {
    setSelectedRow(row);
    setDetailPage(1);
  }

  return (
    <main aria-label={reportTexts.management.services.title}>
      <div className="min-h-screen bg-muted/30 px-6 py-8 text-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <header>
            <Heading level={1} size="page">
              {reportTexts.management.services.title}
            </Heading>
          </header>

          <Tabs
            defaultValue={initialTab}
            tabs={[
              {
                label: reportTexts.serviceComboReport.tabs[
                  REPORT_ITEM_TAB_SERVICE
                ],
                value: REPORT_ITEM_TAB_SERVICE,
              },
              {
                label: reportTexts.serviceComboReport.tabs[
                  REPORT_ITEM_TAB_COMBO
                ],
                value: REPORT_ITEM_TAB_COMBO,
              },
            ]}
            onValueChange={handleTabChange}
          />

          {error ? (
            <InlineAlert>
              {error instanceof Error
                ? error.message
                : reportTexts.api.errors.serverError}
            </InlineAlert>
          ) : null}

          {report ? (
            <section className="rounded-lg border border-gray-400 bg-gray-100 p-4">
              <ReportMetaBar
                items={[
                  {
                    title: reportTexts.serviceComboReport.periodLabel,
                    value: report.periodLabel,
                  },
                  {
                    title: reportTexts.serviceComboReport.branchLabel,
                    value: currentBranchName,
                  },
                ]}
              />
            </section>
          ) : null}

          <Card title={reportTexts.serviceComboReport.filtersTitle}>
            <div
              className={cn(
                "grid items-end gap-3 md:grid-cols-2",
                isOwner && isServiceTab
                  ? "xl:grid-cols-6"
                  : isOwner
                    ? "xl:grid-cols-5"
                    : isServiceTab
                      ? "xl:grid-cols-5"
                      : "xl:grid-cols-4",
              )}
            >
              <ReportDateRangeFilter
                fromDate={draftFilter.fromDate}
                maximumDate={maximumDate}
                toDate={draftFilter.toDate}
                onFromDateChange={handleFromDateChange}
                onToDateChange={handleToDateChange}
              />

              {isOwner ? (
                <label>
                  <span className="text-sm font-medium">
                    {reportTexts.serviceComboReport.branchLabel}
                  </span>
                  <Select
                    className="mt-2"
                    value={draftFilter.branchId}
                    onChange={(event) =>
                      updateDraftFilter((currentFilter) => ({
                        ...currentFilter,
                        branchId: event.target.value,
                      }))
                    }
                  >
                    <option value={ALL_FILTER_VALUE}>
                      {reportTexts.serviceComboReport.allBranches}
                    </option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </Select>
                </label>
              ) : null}

              {isServiceTab ? (
                <label>
                  <span className="text-sm font-medium">
                    {reportTexts.serviceComboReport.roleLabel}
                  </span>
                  <Select
                    className="mt-2"
                    value={draftFilter.responsibleRole}
                    onChange={(event) =>
                      updateDraftFilter((currentFilter) => ({
                        ...currentFilter,
                        responsibleRole: event.target.value,
                      }))
                    }
                  >
                    <option value={ALL_FILTER_VALUE}>
                      {reportTexts.serviceComboReport.allRoles}
                    </option>
                    <option value={SERVICE_RESPONSIBLE_ROLE_BARBER}>
                      {reportTexts.roles[SERVICE_RESPONSIBLE_ROLE_BARBER]}
                    </option>
                    <option value={SERVICE_RESPONSIBLE_ROLE_SKINNER}>
                      {reportTexts.roles[SERVICE_RESPONSIBLE_ROLE_SKINNER]}
                    </option>
                  </Select>
                </label>
              ) : null}

              <label>
                <span className="text-sm font-medium">
                  {reportTexts.serviceComboReport.searchLabel}
                </span>
                <SearchInput
                  className="mt-2"
                  clearLabel="Xóa tìm kiếm"
                  placeholder={reportTexts.serviceComboReport.searchPlaceholder}
                  value={draftFilter.search}
                  onChange={(event) =>
                    updateDraftFilter((currentFilter) => ({
                      ...currentFilter,
                      search: event.target.value,
                    }))
                  }
                  onClear={() =>
                    updateDraftFilter((currentFilter) => ({
                      ...currentFilter,
                      search: "",
                    }))
                  }
                />
              </label>

              <label>
                <span className="text-sm font-medium">
                  {reportTexts.serviceComboReport.sortLabel}
                </span>
                <Select
                  className="mt-2"
                  value={draftFilter.sort}
                  onChange={(event) =>
                    updateDraftFilter((currentFilter) => ({
                      ...currentFilter,
                      sort: event.target.value as ReportUsageSortValue,
                    }))
                  }
                >
                  <option value={REPORT_USAGE_SORT_DESC}>
                    {
                      reportTexts.serviceComboReport.sortOptions[
                        REPORT_USAGE_SORT_DESC
                      ]
                    }
                  </option>
                  <option value={REPORT_USAGE_SORT_ASC}>
                    {
                      reportTexts.serviceComboReport.sortOptions[
                        REPORT_USAGE_SORT_ASC
                      ]
                    }
                  </option>
                </Select>
              </label>

              <Button type="button" onClick={handleFiltersApply}>
                {reportTexts.serviceComboReport.applyFilters}
              </Button>
            </div>
          </Card>

          <Card title={reportTexts.serviceComboReport.tableTitle}>
            {shouldShowInitialSkeleton || shouldShowTableSkeleton ? (
              <div
                aria-label={reportTexts.serviceComboReport.loading}
                className="grid gap-3"
              >
                <Skeleton className="h-12" variant="card" />
                <Skeleton className="h-12" variant="card" />
                <Skeleton className="h-12" variant="card" />
              </div>
            ) : null}

            {!shouldShowInitialSkeleton && !shouldShowTableSkeleton ? (
              report?.rows.length ? (
                <div className="overflow-x-auto rounded-lg border border-gray-400">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <HeaderCell>
                          {reportTexts.serviceComboReport.columns.item}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.serviceComboReport.columns.branch}
                        </HeaderCell>
                        {isAppliedServiceTab ? (
                          <HeaderCell>
                            {
                              reportTexts.serviceComboReport.columns
                                .responsibleRole
                            }
                          </HeaderCell>
                        ) : null}
                        <HeaderCell>
                          {reportTexts.serviceComboReport.columns.usage}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.serviceComboReport.columns.customers}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.serviceComboReport.columns.action}
                        </HeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.rows.map((row) => (
                        <TableRow
                          key={`${row.branchId ?? "shop"}-${row.itemId}`}
                        >
                          <TableCell className="font-semibold">
                            {row.itemName}
                          </TableCell>
                          <TableCell>{row.branchName}</TableCell>
                          {isAppliedServiceTab ? (
                            <TableCell>
                              {getRoleLabel(row.responsibleRole)}
                            </TableCell>
                          ) : null}
                          <TableCell>{row.usageCount}</TableCell>
                          <TableCell>{row.customerCount}</TableCell>
                          <TableCell>
                            <Button
                              disabled={row.detailCount === 0}
                              icon={<Eye aria-hidden="true" className="size-4" />}
                              size="sm"
                              type="button"
                              variant="secondary"
                              onClick={() => handleDetailsOpen(row)}
                            >
                              {reportTexts.serviceComboReport.viewDetails}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  text={reportTexts.serviceComboReport.empty}
                />
              )
            ) : null}
          </Card>
        </div>
      </div>

      <Modal
        containerClassName="max-w-7xl"
        open={Boolean(selectedRow)}
        title={selectedRow?.itemName}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRow(null);
          }
        }}
      >
        <div className="grid gap-4">
          {selectedRow ? (
            <div className="rounded-lg border border-gray-400 bg-gray-100 p-4">
              <ReportMetaBar
                items={[
                  {
                    title: reportTexts.serviceComboReport.branchLabel,
                    value: selectedRow.branchName,
                  },
                  {
                    title: reportTexts.serviceComboReport.periodLabel,
                    value: report?.periodLabel ?? "-",
                  },
                  ...(isAppliedServiceTab
                    ? [
                        {
                          title: reportTexts.serviceComboReport.roleLabel,
                          value: getRoleLabel(selectedRow.responsibleRole),
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          ) : null}

          {detailError ? (
            <div className="grid gap-3">
              <InlineAlert>
                {detailError instanceof Error
                  ? detailError.message
                  : reportTexts.api.errors.serverError}
              </InlineAlert>
              <Button
                className="w-fit"
                type="button"
                variant="secondary"
                onClick={() => void refetchDetails()}
              >
                {reportTexts.serviceComboReport.retryDetails}
              </Button>
            </div>
          ) : null}

          {shouldShowDetailSkeleton ? (
            <div
              aria-label={reportTexts.serviceComboReport.loadingDetails}
              className="grid gap-3"
            >
              <Skeleton className="h-12" variant="card" />
              <Skeleton className="h-12" variant="card" />
              <Skeleton className="h-12" variant="card" />
            </div>
          ) : null}

          {!shouldShowDetailSkeleton && currentDetailReport ? (
            <>
              <ServiceComboReportDetails
                details={currentDetailReport.details}
                showRole={isAppliedServiceTab}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-700">
                  {getDetailPageSummary(currentDetailReport.pagination)}
                </p>
                {currentDetailReport.pagination.totalPages > 1 ? (
                  <div className="flex items-center gap-2">
                    <Button
                      disabled={currentDetailReport.pagination.page === 1}
                      size="sm"
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setDetailPage((currentPage) =>
                          Math.max(1, currentPage - 1),
                        )
                      }
                    >
                      {designSystemTexts.actions.previous}
                    </Button>
                    <Button
                      disabled={
                        currentDetailReport.pagination.page >=
                        currentDetailReport.pagination.totalPages
                      }
                      size="sm"
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setDetailPage((currentPage) =>
                          Math.min(
                            currentDetailReport.pagination.totalPages,
                            currentPage + 1,
                          ),
                        )
                      }
                    >
                      {designSystemTexts.actions.next}
                    </Button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </Modal>
    </main>
  );
}

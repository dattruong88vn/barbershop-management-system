"use client";

import { useMemo, useState } from "react";
import { BarChart3, Eye } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  Heading,
  InlineAlert,
  Modal,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/global";
import {
  BRANCH_STATUS_ACTIVE,
  BRANCH_STATUS_ALL,
  BRANCH_STATUS_INACTIVE,
  type BranchStatusFilterValue,
  type BranchStatusValue,
} from "@/constants/common";
import { designSystemTexts, reportTexts } from "@/constants/texts";
import {
  useBranchReport,
  useBranchReportDetails,
} from "@/hooks/useBranchReport";
import { cn } from "@/lib/utils";
import type {
  BranchReportDetail,
  BranchReportRow,
  ReportPaginationMeta,
} from "@/types";
import { formatDisplayDateTime, formatVndPrice } from "@/utils/common";
import {
  getCurrentMonthReportDateRange,
  getReportDateKey,
} from "@/utils/reports";

import { ReportDateRangeFilter } from "./ReportDateRangeFilter";
import { ReportMetaBar } from "./ReportMetaBar";

const DETAIL_PAGE_SIZE = 10;

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

function getStatusVariant(
  status: BranchStatusValue,
): "default" | "success" | "danger" | "warning" | "info" {
  return status === BRANCH_STATUS_ACTIVE ? "success" : "warning";
}

function formatDateTime(value: string | null) {
  return value ? formatDisplayDateTime(value) : "-";
}

function getDetailPageSummary(pagination: ReportPaginationMeta) {
  return reportTexts.branchReport.detailPageSummary
    .replace("{page}", String(pagination.page))
    .replace("{totalPages}", String(pagination.totalPages))
    .replace("{total}", String(pagination.total));
}

function BranchReportDetails({ details }: { details: BranchReportDetail[] }) {
  if (!details.length) {
    return <EmptyState icon={BarChart3} text={reportTexts.branchReport.empty} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-400">
      <Table>
        <TableHead>
          <TableRow>
            <HeaderCell>{reportTexts.branchReport.detailColumns.visit}</HeaderCell>
            <HeaderCell>{reportTexts.branchReport.detailColumns.completedAt}</HeaderCell>
            <HeaderCell>{reportTexts.branchReport.detailColumns.customer}</HeaderCell>
            <HeaderCell>
              {reportTexts.branchReport.detailColumns.receptionist}
            </HeaderCell>
            <HeaderCell>{reportTexts.branchReport.detailColumns.barber}</HeaderCell>
            <HeaderCell>{reportTexts.branchReport.detailColumns.skinner}</HeaderCell>
            <HeaderCell>{reportTexts.branchReport.detailColumns.services}</HeaderCell>
            <HeaderCell>{reportTexts.branchReport.detailColumns.revenue}</HeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {details.map((detail) => (
            <TableRow key={detail.visitId}>
              <TableCell className="font-mono text-xs">
                {detail.visitId.slice(0, 8)}
              </TableCell>
              <TableCell>{formatDateTime(detail.completedAt)}</TableCell>
              <TableCell>{detail.customerName}</TableCell>
              <TableCell>{detail.receptionistName}</TableCell>
              <TableCell>{detail.barberName ?? "-"}</TableCell>
              <TableCell>{detail.skinnerName ?? "-"}</TableCell>
              <TableCell>{detail.serviceCount}</TableCell>
              <TableCell>{formatVndPrice(detail.revenue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function BranchReportView() {
  const initialDateRange = useMemo(() => getCurrentMonthReportDateRange(), []);
  const [fromDate, setFromDate] = useState(initialDateRange.fromDate);
  const [toDate, setToDate] = useState(initialDateRange.toDate);
  const [status, setStatus] =
    useState<BranchStatusFilterValue>(BRANCH_STATUS_ALL);
  const [appliedFilter, setAppliedFilter] = useState({
    fromDate: initialDateRange.fromDate,
    status: BRANCH_STATUS_ALL as BranchStatusFilterValue,
    toDate: initialDateRange.toDate,
  });
  const [selectedRow, setSelectedRow] = useState<BranchReportRow | null>(null);
  const [detailPage, setDetailPage] = useState(1);
  const reportFilter = {
    fromDate: appliedFilter.fromDate,
    status:
      appliedFilter.status === BRANCH_STATUS_ALL
        ? undefined
        : appliedFilter.status,
    toDate: appliedFilter.toDate,
  };
  const { error, isFetching, isLoading, report } =
    useBranchReport(reportFilter);
  const detailFilter = {
    ...reportFilter,
    branchId: selectedRow?.branchId ?? "",
    page: detailPage,
    pageSize: DETAIL_PAGE_SIZE,
  };
  const {
    error: detailError,
    isFetching: isFetchingDetails,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
    report: detailReport,
  } = useBranchReportDetails(detailFilter, Boolean(selectedRow));
  const shouldShowInitialSkeleton = isLoading && !report;
  const shouldShowTableSkeleton = isFetching;
  const currentDetailReport =
    detailReport?.branchId === selectedRow?.branchId ? detailReport : null;
  const shouldShowDetailSkeleton =
    isLoadingDetails || (isFetchingDetails && !currentDetailReport);
  const maximumDate = getReportDateKey();

  function handleFromDateChange(nextFromDate: string) {
    setFromDate(nextFromDate);

    if (nextFromDate > toDate) {
      setToDate(nextFromDate);
    }
  }

  function handleToDateChange(nextToDate: string) {
    setToDate(nextToDate);

    if (nextToDate < fromDate) {
      setFromDate(nextToDate);
    }
  }

  function handleFiltersApply() {
    setAppliedFilter({
      fromDate,
      status,
      toDate,
    });
    setSelectedRow(null);
    setDetailPage(1);
  }

  function handleDetailsOpen(row: BranchReportRow) {
    setSelectedRow(row);
    setDetailPage(1);
  }

  return (
    <main aria-label={reportTexts.management.branches.title}>
      <div className="min-h-screen bg-muted/30 px-6 py-8 text-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <header>
            <Heading level={1} size="page">
              {reportTexts.management.branches.title}
            </Heading>
          </header>

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
                    title: reportTexts.branchReport.periodLabel,
                    value: report.periodLabel,
                  },
                ]}
              />
            </section>
          ) : null}

          <Card title={reportTexts.branchReport.filtersTitle}>
            <div className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-3">
              <ReportDateRangeFilter
                fromDate={fromDate}
                maximumDate={maximumDate}
                toDate={toDate}
                onFromDateChange={handleFromDateChange}
                onToDateChange={handleToDateChange}
              />

              <label>
                <span className="text-sm font-medium">
                  {reportTexts.branchReport.statusLabel}
                </span>
                <Select
                  className="mt-2"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as BranchStatusFilterValue)
                  }
                >
                  <option value={BRANCH_STATUS_ALL}>
                    {reportTexts.branchReport.allStatuses}
                  </option>
                  <option value={BRANCH_STATUS_ACTIVE}>
                    {reportTexts.branchReport.statusLabels[BRANCH_STATUS_ACTIVE]}
                  </option>
                  <option value={BRANCH_STATUS_INACTIVE}>
                    {reportTexts.branchReport.statusLabels[BRANCH_STATUS_INACTIVE]}
                  </option>
                </Select>
              </label>

              <div className="flex justify-end md:justify-self-end">
                <Button type="button" onClick={handleFiltersApply}>
                  {reportTexts.branchReport.applyFilters}
                </Button>
              </div>
            </div>
          </Card>

          <Card title={reportTexts.branchReport.tableTitle}>
            {shouldShowInitialSkeleton || shouldShowTableSkeleton ? (
              <div
                aria-label={reportTexts.branchReport.loading}
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
                          {reportTexts.branchReport.columns.branch}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.branchReport.columns.status}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.branchReport.columns.visits}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.branchReport.columns.customers}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.branchReport.columns.services}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.branchReport.columns.revenue}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.branchReport.columns.action}
                        </HeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.rows.map((row) => (
                        <TableRow key={row.branchId}>
                          <TableCell className="font-semibold">
                            {row.branchName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              size="sm"
                              variant={getStatusVariant(row.status)}
                            >
                              {reportTexts.branchReport.statusLabels[row.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>{row.visitCount}</TableCell>
                          <TableCell>{row.customerCount}</TableCell>
                          <TableCell>{row.serviceCount}</TableCell>
                          <TableCell>{formatVndPrice(row.revenue)}</TableCell>
                          <TableCell>
                            <Button
                              disabled={row.detailCount === 0}
                              icon={<Eye aria-hidden="true" className="size-4" />}
                              size="sm"
                              type="button"
                              variant="secondary"
                              onClick={() => handleDetailsOpen(row)}
                            >
                              {reportTexts.branchReport.viewDetails}
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
                  text={reportTexts.branchReport.empty}
                />
              )
            ) : null}
          </Card>
        </div>
      </div>

      <Modal
        containerClassName="max-w-7xl"
        open={Boolean(selectedRow)}
        title={selectedRow?.branchName}
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
                    title: reportTexts.branchReport.statusLabel,
                    value:
                      reportTexts.branchReport.statusLabels[selectedRow.status],
                  },
                  {
                    title: reportTexts.branchReport.periodLabel,
                    value: report?.periodLabel ?? "-",
                  },
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
                {reportTexts.branchReport.retryDetails}
              </Button>
            </div>
          ) : null}

          {shouldShowDetailSkeleton ? (
            <div
              aria-label={reportTexts.branchReport.loadingDetails}
              className="grid gap-3"
            >
              <Skeleton className="h-12" variant="card" />
              <Skeleton className="h-12" variant="card" />
              <Skeleton className="h-12" variant="card" />
            </div>
          ) : null}

          {!shouldShowDetailSkeleton && currentDetailReport ? (
            <>
              <BranchReportDetails details={currentDetailReport.details} />
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

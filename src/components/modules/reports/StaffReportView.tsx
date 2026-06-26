"use client";

import { useMemo, useState } from "react";
import { BarChart3, Eye } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  Badge,
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
} from "@/components/global";
import {
  StaffReportStatus,
  USER_ROLE_BARBER,
  USER_ROLE_OWNER,
  USER_ROLE_RECEPTIONIST,
  USER_ROLE_SKINNER,
} from "@/constants/common";
import { designSystemTexts, reportTexts } from "@/constants/texts";
import { useBranches } from "@/hooks/useBranches";
import {
  useStaffReport,
  useStaffReportDetails,
} from "@/hooks/useStaffReport";
import { cn } from "@/lib/utils";
import type {
  ReportPaginationMeta,
  StaffReportDetail,
  StaffReportRow,
} from "@/types";
import {
  getCurrentMonthReportDateRange,
  getReportDateKey,
} from "@/utils/reports";

import { ReportDateRangeFilter } from "./ReportDateRangeFilter";
import { ReportMetaBar } from "./ReportMetaBar";

const ALL_FILTER_VALUE = "all";
const DETAIL_PAGE_SIZE = 10;
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  year: "numeric",
});

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
  status: StaffReportStatus,
): "default" | "success" | "danger" | "warning" | "info" {
  if (status === StaffReportStatus.Active) return "success";
  if (status === StaffReportStatus.BranchSuspended) return "warning";
  if (status === StaffReportStatus.Unknown) return "danger";

  return "default";
}

function formatDateTime(value: string | null) {
  return value ? DATE_TIME_FORMATTER.format(new Date(value)) : "-";
}

function getRoleLabel(role: StaffReportRow["role"]) {
  if (role === "unknown") {
    return reportTexts.staffReport.unknownRole;
  }

  return reportTexts.roles[role];
}

function getDetailPageSummary(pagination: ReportPaginationMeta) {
  return reportTexts.staffReport.detailPageSummary
    .replace("{page}", String(pagination.page))
    .replace("{totalPages}", String(pagination.totalPages))
    .replace("{total}", String(pagination.total));
}

function StaffReportDetails({ details }: { details: StaffReportDetail[] }) {
  if (!details.length) {
    return <EmptyState icon={BarChart3} text={reportTexts.staffReport.empty} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-400">
      <Table>
        <TableHead>
          <TableRow>
            <HeaderCell>{reportTexts.staffReport.detailColumns.visit}</HeaderCell>
            <HeaderCell>{reportTexts.staffReport.detailColumns.customer}</HeaderCell>
            <HeaderCell>{reportTexts.staffReport.detailColumns.item}</HeaderCell>
            <HeaderCell>{reportTexts.staffReport.detailColumns.role}</HeaderCell>
            <HeaderCell>{reportTexts.staffReport.detailColumns.branch}</HeaderCell>
            <HeaderCell>{reportTexts.staffReport.detailColumns.completedAt}</HeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {details.map((detail) => (
            <TableRow
              key={`${detail.visitId}-${detail.itemName}-${detail.responsibleRole}`}
            >
              <TableCell className="font-mono text-xs">
                {detail.visitId.slice(0, 8)}
              </TableCell>
              <TableCell>{detail.customerName}</TableCell>
              <TableCell>{detail.itemName}</TableCell>
              <TableCell>{detail.responsibleRole}</TableCell>
              <TableCell>{detail.branchName}</TableCell>
              <TableCell>{formatDateTime(detail.completedAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function StaffReportView() {
  const { data: session } = useSession();
  const isOwner = session?.user.role === USER_ROLE_OWNER;
  const initialDateRange = useMemo(() => getCurrentMonthReportDateRange(), []);
  const [fromDate, setFromDate] = useState(initialDateRange.fromDate);
  const [toDate, setToDate] = useState(initialDateRange.toDate);
  const [branchId, setBranchId] = useState(ALL_FILTER_VALUE);
  const [role, setRole] = useState(ALL_FILTER_VALUE);
  const [search, setSearch] = useState("");
  const [appliedFilter, setAppliedFilter] = useState({
    branchId: ALL_FILTER_VALUE,
    fromDate: initialDateRange.fromDate,
    role: ALL_FILTER_VALUE,
    search: "",
    toDate: initialDateRange.toDate,
  });
  const [selectedRow, setSelectedRow] = useState<StaffReportRow | null>(null);
  const [detailPage, setDetailPage] = useState(1);
  const reportFilter = {
    fromDate: appliedFilter.fromDate,
    toDate: appliedFilter.toDate,
    ...(isOwner && appliedFilter.branchId !== ALL_FILTER_VALUE
      ? { branchId: appliedFilter.branchId }
      : {}),
    ...(appliedFilter.role !== ALL_FILTER_VALUE
      ? { role: appliedFilter.role }
      : {}),
    ...(appliedFilter.search ? { search: appliedFilter.search } : {}),
  };
  const { branches, isLoading: isLoadingBranches } = useBranches(isOwner);
  const { error, isFetching, isLoading, report } = useStaffReport(reportFilter);
  const detailFilter = {
    ...reportFilter,
    page: detailPage,
    pageSize: DETAIL_PAGE_SIZE,
    staffId: selectedRow?.staffId ?? "",
  };
  const {
    error: detailError,
    isFetching: isFetchingDetails,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
    report: detailReport,
  } = useStaffReportDetails(detailFilter, Boolean(selectedRow));
  const shouldShowInitialSkeleton = isLoading && !report;
  const shouldShowTableSkeleton = isFetching || isLoadingBranches;
  const currentBranchName =
    report?.branchName ??
    (isOwner && appliedFilter.branchId !== ALL_FILTER_VALUE
      ? branches.find((branch) => branch.id === appliedFilter.branchId)?.name
      : null) ??
    reportTexts.staffReport.allBranches;
  const currentDetailReport =
    detailReport?.staffId === selectedRow?.staffId ? detailReport : null;
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

  function handleDetailsOpen(row: StaffReportRow) {
    setSelectedRow(row);
    setDetailPage(1);
  }

  function handleFiltersApply() {
    setAppliedFilter({
      branchId,
      fromDate,
      role,
      search: search.trim(),
      toDate,
    });
    setSelectedRow(null);
    setDetailPage(1);
  }

  return (
    <main aria-label={reportTexts.management.staff.title}>
      <div className="min-h-screen bg-muted/30 px-6 py-8 text-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <header>
            <Heading level={1} size="page">
              {reportTexts.management.staff.title}
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
                    title: reportTexts.staffReport.periodLabel,
                    value: report.periodLabel,
                  },
                  {
                    title: reportTexts.staffReport.currentBranchLabel,
                    value: currentBranchName,
                  },
                ]}
              />
            </section>
          ) : null}

          <Card title={reportTexts.staffReport.filtersTitle}>
            <div
              className={cn(
                "grid items-end gap-3 md:grid-cols-2",
                isOwner ? "xl:grid-cols-5" : "xl:grid-cols-4",
              )}
            >
              <ReportDateRangeFilter
                fromDate={fromDate}
                maximumDate={maximumDate}
                toDate={toDate}
                onFromDateChange={handleFromDateChange}
                onToDateChange={handleToDateChange}
              />

              {isOwner ? (
                <label>
                  <span className="text-sm font-medium">
                    {reportTexts.staffReport.branchLabel}
                  </span>
                  <Select
                    className="mt-2"
                    value={branchId}
                    onChange={(event) => setBranchId(event.target.value)}
                  >
                    <option value={ALL_FILTER_VALUE}>
                      {reportTexts.staffReport.allBranches}
                    </option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </Select>
                </label>
              ) : null}

              <label>
                <span className="text-sm font-medium">
                  {reportTexts.staffReport.roleLabel}
                </span>
                <Select
                  className="mt-2"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                >
                  <option value={ALL_FILTER_VALUE}>
                    {reportTexts.staffReport.allRoles}
                  </option>
                  <option value={USER_ROLE_RECEPTIONIST}>
                    {reportTexts.roles[USER_ROLE_RECEPTIONIST]}
                  </option>
                  <option value={USER_ROLE_BARBER}>
                    {reportTexts.roles[USER_ROLE_BARBER]}
                  </option>
                  <option value={USER_ROLE_SKINNER}>
                    {reportTexts.roles[USER_ROLE_SKINNER]}
                  </option>
                </Select>
              </label>

              <label>
                <span className="text-sm font-medium">
                  {reportTexts.staffReport.columns.staff}
                </span>
                <SearchInput
                  className="mt-2"
                  clearLabel="Xóa tìm kiếm"
                  placeholder={reportTexts.staffReport.columns.staff}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onClear={() => setSearch("")}
                />
              </label>

              <div className="flex justify-end md:justify-self-end">
                <Button type="button" onClick={handleFiltersApply}>
                  {reportTexts.staffReport.applyFilters}
                </Button>
              </div>
            </div>
          </Card>

          <Card title={reportTexts.staffReport.tableTitle}>
            {shouldShowInitialSkeleton || shouldShowTableSkeleton ? (
              <div
                aria-label={reportTexts.staffReport.loading}
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
                          {reportTexts.staffReport.columns.staff}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.staffReport.columns.role}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.staffReport.columns.status}
                        </HeaderCell>
                        {isOwner ? (
                          <HeaderCell>
                            {reportTexts.staffReport.columns.branch}
                          </HeaderCell>
                        ) : null}
                        <HeaderCell>
                          {reportTexts.staffReport.columns.services}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.staffReport.columns.visits}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.staffReport.columns.customers}
                        </HeaderCell>
                        <HeaderCell>
                          {reportTexts.staffReport.columns.action}
                        </HeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.rows.map((row) => {
                        return (
                          <TableRow key={row.staffId}>
                            <TableCell className="font-semibold">
                              {row.staffName}
                            </TableCell>
                            <TableCell>{getRoleLabel(row.role)}</TableCell>
                            <TableCell>
                              <Badge
                                size="sm"
                                variant={getStatusVariant(row.status)}
                              >
                                {reportTexts.staffReport.statusLabels[row.status]}
                              </Badge>
                            </TableCell>
                            {isOwner ? (
                              <TableCell>{row.branchName ?? "-"}</TableCell>
                            ) : null}
                            <TableCell>{row.serviceCount}</TableCell>
                            <TableCell>{row.visitCount}</TableCell>
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
                                {reportTexts.staffReport.viewDetails}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState
                  icon={BarChart3}
                  text={reportTexts.staffReport.empty}
                />
              )
            ) : null}
          </Card>
        </div>
      </div>

      <Modal
        containerClassName="max-w-7xl"
        open={Boolean(selectedRow)}
        title={selectedRow?.staffName}
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
                    title: reportTexts.staffReport.roleLabel,
                    value: getRoleLabel(selectedRow.role),
                  },
                  {
                    title: reportTexts.staffReport.periodLabel,
                    value: report?.periodLabel ?? "-",
                  },
                  {
                    title: reportTexts.staffReport.currentBranchLabel,
                    value: selectedRow.branchName ?? currentBranchName,
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
                {reportTexts.staffReport.retryDetails}
              </Button>
            </div>
          ) : null}

          {shouldShowDetailSkeleton ? (
            <div
              aria-label={reportTexts.staffReport.loadingDetails}
              className="grid gap-3"
            >
              <Skeleton className="h-12" variant="card" />
              <Skeleton className="h-12" variant="card" />
              <Skeleton className="h-12" variant="card" />
            </div>
          ) : null}

          {!shouldShowDetailSkeleton && currentDetailReport ? (
            <>
              <StaffReportDetails details={currentDetailReport.details} />
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

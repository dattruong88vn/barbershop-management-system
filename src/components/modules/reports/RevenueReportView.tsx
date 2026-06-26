"use client";

import { useMemo, useState } from "react";
import { BarChart3, Eye } from "lucide-react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

import {
  Button,
  Card,
  ChartContainer,
  ChartTooltipContent,
  EmptyState,
  Heading,
  InlineAlert,
  Modal,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
} from "@/components/global";
import {
  REVENUE_REPORT_TAB_BRANCH,
  REVENUE_REPORT_TAB_ITEM,
  type RevenueReportItemTypeValue,
  type RevenueReportTabValue,
} from "@/constants/common";
import { designSystemTexts, reportTexts } from "@/constants/texts";
import {
  useRevenueReport,
  useRevenueReportDetails,
} from "@/hooks/useRevenueReport";
import { cn } from "@/lib/utils";
import type {
  ReportPaginationMeta,
  RevenueReportBranchRow,
  RevenueReportDetail,
  RevenueReportItemRow,
  RevenueReportPieSegment,
} from "@/types";
import { formatDisplayDateTime, formatVndPrice } from "@/utils/common";
import {
  getCurrentMonthReportDateRange,
  getReportDateKey,
} from "@/utils/reports";

import { ReportDateRangeFilter } from "./ReportDateRangeFilter";
import { ReportMetaBar } from "./ReportMetaBar";

const DETAIL_PAGE_SIZE = 10;
const PIE_DATA_KEY = "revenue";
const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type SelectedRevenueRow =
  | {
      branchName: string;
      drilldownId: string;
      itemName: string;
      itemType?: never;
      tab: typeof REVENUE_REPORT_TAB_BRANCH;
    }
  | {
      branchName?: never;
      drilldownId: string;
      itemName: string;
      itemType: RevenueReportItemTypeValue;
      tab: typeof REVENUE_REPORT_TAB_ITEM;
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

function formatPercent(value: number) {
  return `${value.toLocaleString("vi-VN", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value > 0 && value < 1 ? 1 : 0,
  })}%`;
}

function getDetailPageSummary(pagination: ReportPaginationMeta) {
  return reportTexts.revenueReport.detailPageSummary
    .replace("{page}", String(pagination.page))
    .replace("{totalPages}", String(pagination.totalPages))
    .replace("{total}", String(pagination.total));
}

function RevenueMetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-400 bg-gray-100 p-4">
      <p className="text-sm text-gray-700">{label}</p>
      <p className="mt-2 text-xl font-semibold text-gray-1000">{value}</p>
    </div>
  );
}

function RevenuePieChart({
  data,
  title,
}: {
  data: RevenueReportPieSegment[];
  title: string;
}) {
  return (
    <Card title={title}>
      {data.length ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)] lg:items-center">
          <ChartContainer minHeightClassName="h-64">
            <PieChart>
              <Tooltip
                content={
                  <ChartTooltipContent
                    valueFormatter={(value) => formatVndPrice(Number(value))}
                  />
                }
              />
              <Pie
                cx="50%"
                cy="50%"
                data={data}
                dataKey={PIE_DATA_KEY}
                innerRadius={52}
                nameKey="label"
                outerRadius={92}
                paddingAngle={2}
              >
                {data.map((segment, index) => (
                  <Cell
                    key={segment.id}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="grid gap-2">
            {data.map((segment, index) => (
              <div
                key={segment.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2 text-gray-700">
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                    }}
                  />
                  <span className="truncate">{segment.label}</span>
                </span>
                <span className="shrink-0 font-medium text-gray-1000">
                  {formatPercent(segment.revenueShare)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState icon={BarChart3} text={reportTexts.revenueReport.empty} />
      )}
    </Card>
  );
}

function RevenueReportDetails({
  details,
  showItem,
}: {
  details: RevenueReportDetail[];
  showItem: boolean;
}) {
  if (!details.length) {
    return <EmptyState icon={BarChart3} text={reportTexts.revenueReport.empty} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-400">
      <Table>
        <TableHead>
          <TableRow>
            <HeaderCell>{reportTexts.revenueReport.detailColumns.visit}</HeaderCell>
            <HeaderCell>
              {reportTexts.revenueReport.detailColumns.completedAt}
            </HeaderCell>
            <HeaderCell>
              {reportTexts.revenueReport.detailColumns.branch}
            </HeaderCell>
            <HeaderCell>
              {reportTexts.revenueReport.detailColumns.customer}
            </HeaderCell>
            <HeaderCell>
              {reportTexts.revenueReport.detailColumns.receptionist}
            </HeaderCell>
            <HeaderCell>{reportTexts.revenueReport.detailColumns.barber}</HeaderCell>
            <HeaderCell>
              {reportTexts.revenueReport.detailColumns.skinner}
            </HeaderCell>
            {showItem ? (
              <HeaderCell>{reportTexts.revenueReport.detailColumns.item}</HeaderCell>
            ) : (
              <HeaderCell>
                {reportTexts.revenueReport.detailColumns.services}
              </HeaderCell>
            )}
            <HeaderCell>
              {reportTexts.revenueReport.detailColumns.revenue}
            </HeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {details.map((detail) => (
            <TableRow key={`${detail.visitId}-${detail.itemName ?? "branch"}`}>
              <TableCell className="font-mono text-xs">
                {detail.visitId.slice(0, 8)}
              </TableCell>
              <TableCell>{formatDateTime(detail.completedAt)}</TableCell>
              <TableCell>{detail.branchName}</TableCell>
              <TableCell>{detail.customerName}</TableCell>
              <TableCell>{detail.receptionistName}</TableCell>
              <TableCell>{detail.barberName ?? "-"}</TableCell>
              <TableCell>{detail.skinnerName ?? "-"}</TableCell>
              <TableCell>
                {showItem ? detail.itemName : detail.serviceCount}
              </TableCell>
              <TableCell>{formatVndPrice(detail.revenue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function RevenueReportView() {
  const initialDateRange = useMemo(() => getCurrentMonthReportDateRange(), []);
  const [tab, setTab] =
    useState<RevenueReportTabValue>(REVENUE_REPORT_TAB_BRANCH);
  const [fromDate, setFromDate] = useState(initialDateRange.fromDate);
  const [toDate, setToDate] = useState(initialDateRange.toDate);
  const [appliedFilter, setAppliedFilter] = useState({
    fromDate: initialDateRange.fromDate,
    toDate: initialDateRange.toDate,
  });
  const [selectedRow, setSelectedRow] = useState<SelectedRevenueRow | null>(
    null,
  );
  const [detailPage, setDetailPage] = useState(1);
  const reportFilter = {
    fromDate: appliedFilter.fromDate,
    tab,
    toDate: appliedFilter.toDate,
  };
  const { error, isFetching, isLoading, report } =
    useRevenueReport(reportFilter);
  const detailFilter = {
    ...reportFilter,
    drilldownId: selectedRow?.drilldownId ?? "",
    itemType: selectedRow?.tab === REVENUE_REPORT_TAB_ITEM
      ? selectedRow.itemType
      : undefined,
    page: detailPage,
    pageSize: DETAIL_PAGE_SIZE,
  };
  const {
    error: detailError,
    isFetching: isFetchingDetails,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
    report: detailReport,
  } = useRevenueReportDetails(detailFilter, Boolean(selectedRow));
  const maximumDate = getReportDateKey();
  const shouldShowInitialSkeleton = isLoading && !report;
  const shouldShowTableSkeleton = isFetching && !report;
  const currentDetailReport =
    detailReport &&
    detailReport.drilldownId === selectedRow?.drilldownId &&
    detailReport.tab === selectedRow?.tab
      ? detailReport
      : null;
  const shouldShowDetailSkeleton =
    isLoadingDetails || (isFetchingDetails && !currentDetailReport);
  const isBranchTab = tab === REVENUE_REPORT_TAB_BRANCH;

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

  function handleTabChange(nextTab: string) {
    if (
      nextTab !== REVENUE_REPORT_TAB_BRANCH &&
      nextTab !== REVENUE_REPORT_TAB_ITEM
    ) {
      return;
    }

    setTab(nextTab);
    setSelectedRow(null);
    setDetailPage(1);
  }

  function handleFiltersApply() {
    setAppliedFilter({ fromDate, toDate });
    setSelectedRow(null);
    setDetailPage(1);
  }

  function handleBranchDetailsOpen(row: RevenueReportBranchRow) {
    setSelectedRow({
      branchName: row.branchName,
      drilldownId: row.branchId,
      itemName: row.branchName,
      tab: REVENUE_REPORT_TAB_BRANCH,
    });
    setDetailPage(1);
  }

  function handleItemDetailsOpen(row: RevenueReportItemRow) {
    setSelectedRow({
      drilldownId: row.itemId,
      itemName: row.itemName,
      itemType: row.itemType,
      tab: REVENUE_REPORT_TAB_ITEM,
    });
    setDetailPage(1);
  }

  return (
    <main aria-label={reportTexts.management.revenue.title}>
      <div className="min-h-screen bg-muted/30 px-6 py-8 text-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <header>
            <Heading level={1} size="page">
              {reportTexts.management.revenue.title}
            </Heading>
          </header>

          <Tabs
            defaultValue={REVENUE_REPORT_TAB_BRANCH}
            tabs={[
              {
                label: reportTexts.revenueReport.tabs[REVENUE_REPORT_TAB_BRANCH],
                value: REVENUE_REPORT_TAB_BRANCH,
              },
              {
                label: reportTexts.revenueReport.tabs[REVENUE_REPORT_TAB_ITEM],
                value: REVENUE_REPORT_TAB_ITEM,
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
                    title: reportTexts.revenueReport.periodLabel,
                    value: report.periodLabel,
                  },
                  ...(report.branchName
                    ? [
                        {
                          title: reportTexts.revenueReport.branchLabel,
                          value: report.branchName,
                        },
                      ]
                    : []),
                ]}
              />
            </section>
          ) : null}

          <Card title={reportTexts.revenueReport.filtersTitle}>
            <div className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-3">
              <ReportDateRangeFilter
                fromDate={fromDate}
                maximumDate={maximumDate}
                toDate={toDate}
                onFromDateChange={handleFromDateChange}
                onToDateChange={handleToDateChange}
              />

              <Button type="button" onClick={handleFiltersApply}>
                {reportTexts.revenueReport.applyFilters}
              </Button>
            </div>
          </Card>

          {report ? (
            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <RevenueMetricCard
                label={reportTexts.revenueReport.totalLabels.revenue}
                value={formatVndPrice(report.totals.revenue)}
              />
              <RevenueMetricCard
                label={reportTexts.revenueReport.totalLabels.visits}
                value={String(report.totals.visitCount)}
              />
              <RevenueMetricCard
                label={reportTexts.revenueReport.totalLabels.customers}
                value={String(report.totals.customerCount)}
              />
              <RevenueMetricCard
                label={reportTexts.revenueReport.totalLabels.services}
                value={String(report.totals.serviceCount)}
              />
            </section>
          ) : null}

          {shouldShowInitialSkeleton || shouldShowTableSkeleton ? (
            <Card title={reportTexts.revenueReport.loading}>
              <div
                aria-label={reportTexts.revenueReport.loading}
                className="grid gap-3"
              >
                <Skeleton className="h-12" variant="card" />
                <Skeleton className="h-12" variant="card" />
                <Skeleton className="h-12" variant="card" />
              </div>
            </Card>
          ) : null}

          {!shouldShowInitialSkeleton && !shouldShowTableSkeleton && report ? (
            isBranchTab ? (
              <Card title={reportTexts.revenueReport.tableTitles.branch}>
                {report.branchRows.length ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-400">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <HeaderCell>
                            {reportTexts.revenueReport.columns.branch}
                          </HeaderCell>
                          <HeaderCell>
                            {reportTexts.revenueReport.columns.visits}
                          </HeaderCell>
                          <HeaderCell>
                            {reportTexts.revenueReport.columns.customers}
                          </HeaderCell>
                          <HeaderCell>
                            {reportTexts.revenueReport.columns.services}
                          </HeaderCell>
                          <HeaderCell>
                            {reportTexts.revenueReport.columns.revenue}
                          </HeaderCell>
                          <HeaderCell>
                            {reportTexts.revenueReport.columns.action}
                          </HeaderCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {report.branchRows.map((row) => (
                          <TableRow key={row.branchId}>
                            <TableCell className="font-semibold">
                              {row.branchName}
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
                                onClick={() => handleBranchDetailsOpen(row)}
                              >
                                {reportTexts.revenueReport.viewDetails}
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
                    text={reportTexts.revenueReport.empty}
                  />
                )}
              </Card>
            ) : (
              <>
                <div className="grid gap-4 xl:grid-cols-3">
                  <RevenuePieChart
                    data={report.itemTypePie}
                    title={reportTexts.revenueReport.pieTitles.itemType}
                  />
                  <RevenuePieChart
                    data={report.comboPie}
                    title={reportTexts.revenueReport.pieTitles.combo}
                  />
                  <RevenuePieChart
                    data={report.servicePie}
                    title={reportTexts.revenueReport.pieTitles.service}
                  />
                </div>

                <Card title={reportTexts.revenueReport.tableTitles.item}>
                  {report.itemRows.length ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-400">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <HeaderCell>
                              {reportTexts.revenueReport.columns.item}
                            </HeaderCell>
                            <HeaderCell>
                              {reportTexts.revenueReport.columns.itemType}
                            </HeaderCell>
                            <HeaderCell>
                              {reportTexts.revenueReport.columns.usage}
                            </HeaderCell>
                            <HeaderCell>
                              {reportTexts.revenueReport.columns.customers}
                            </HeaderCell>
                            <HeaderCell>
                              {reportTexts.revenueReport.columns.revenue}
                            </HeaderCell>
                            <HeaderCell>
                              {reportTexts.revenueReport.columns.revenueShare}
                            </HeaderCell>
                            <HeaderCell>
                              {reportTexts.revenueReport.columns.action}
                            </HeaderCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {report.itemRows.map((row) => (
                            <TableRow key={`${row.itemType}-${row.itemId}`}>
                              <TableCell className="font-semibold">
                                {row.itemName}
                              </TableCell>
                              <TableCell>
                                {reportTexts.revenueReport.itemTypes[row.itemType]}
                              </TableCell>
                              <TableCell>{row.usageCount}</TableCell>
                              <TableCell>{row.customerCount}</TableCell>
                              <TableCell>{formatVndPrice(row.revenue)}</TableCell>
                              <TableCell>{formatPercent(row.revenueShare)}</TableCell>
                              <TableCell>
                                <Button
                                  disabled={row.detailCount === 0}
                                  icon={
                                    <Eye aria-hidden="true" className="size-4" />
                                  }
                                  size="sm"
                                  type="button"
                                  variant="secondary"
                                  onClick={() => handleItemDetailsOpen(row)}
                                >
                                  {reportTexts.revenueReport.viewDetails}
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
                      text={reportTexts.revenueReport.empty}
                    />
                  )}
                </Card>
              </>
            )
          ) : null}
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
                  ...(selectedRow.tab === REVENUE_REPORT_TAB_BRANCH
                    ? [
                        {
                          title: reportTexts.revenueReport.branchLabel,
                          value: selectedRow.branchName,
                        },
                      ]
                    : [
                        {
                          title: reportTexts.revenueReport.columns.itemType,
                          value:
                            reportTexts.revenueReport.itemTypes[
                              selectedRow.itemType
                            ],
                        },
                      ]),
                  {
                    title: reportTexts.revenueReport.periodLabel,
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
                {reportTexts.revenueReport.retryDetails}
              </Button>
            </div>
          ) : null}

          {shouldShowDetailSkeleton ? (
            <div
              aria-label={reportTexts.revenueReport.loadingDetails}
              className="grid gap-3"
            >
              <Skeleton className="h-12" variant="card" />
              <Skeleton className="h-12" variant="card" />
              <Skeleton className="h-12" variant="card" />
            </div>
          ) : null}

          {!shouldShowDetailSkeleton && currentDetailReport ? (
            <>
              <RevenueReportDetails
                details={currentDetailReport.details}
                showItem={selectedRow?.tab === REVENUE_REPORT_TAB_ITEM}
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

"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { useSession } from "next-auth/react";

import { Card, Heading, Modal, MonthCalendar } from "@/components/global";
import { EmptyState } from "@/components/global/EmptyState";
import { InlineAlert } from "@/components/global/InlineAlert";
import {
  DashboardHaircutWarnings,
  DashboardMetricCard,
  DashboardPeriodFilter,
  DashboardRevenueTrend,
  DashboardSkeleton,
  DashboardTopList,
} from "@/components/screens/dashboard";
import {
  BRANCH_STATUS_ALL,
  REPORT_PERIOD_ALL,
  REPORT_PERIOD_MONTH,
  REPORT_PERIOD_YEAR,
  type ReportPeriodValue,
  USER_ROLE_OWNER,
} from "@/constants/common";
import { dashboardTexts } from "@/constants/texts";
import { useBranches } from "@/hooks/useBranches";
import { useDashboard } from "@/hooks/useDashboard";
import {
  getDashboardPeriodFilter,
  getMinimumReportMonthKey,
  getReportMonthKey,
} from "@/utils/reports";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [period, setPeriod] = useState<ReportPeriodValue>(
    REPORT_PERIOD_MONTH,
  );
  const [selectedMonth, setSelectedMonth] = useState(getReportMonthKey());
  const [selectedBranchId, setSelectedBranchId] =
    useState<string>(BRANCH_STATUS_ALL);
  const [isMonthCalendarOpen, setIsMonthCalendarOpen] = useState(false);
  const isOwner = session?.user.role === USER_ROLE_OWNER;
  const { branches } = useBranches(isOwner);
  const dashboardBranchId =
    isOwner && selectedBranchId !== BRANCH_STATUS_ALL
      ? selectedBranchId
      : undefined;
  const dashboardFilter = getDashboardPeriodFilter({
    branchId: dashboardBranchId,
    month: selectedMonth,
    period,
  });
  const { dashboard, error, isFetching, isLoading } =
    useDashboard(dashboardFilter);
  const shouldShowInitialSkeleton = isLoading && !dashboard;
  const shouldShowDataSkeleton = isFetching && Boolean(dashboard);
  const maximumMonth = getReportMonthKey();
  const minimumMonth = getMinimumReportMonthKey();
  const branchOptions = [
    {
      label: dashboardTexts.filters.branchOptions.all,
      value: BRANCH_STATUS_ALL,
    },
    ...branches.map((branch) => ({
      label: branch.name,
      value: branch.id,
    })),
  ];

  function handlePeriodChange(nextPeriod: ReportPeriodValue) {
    if (nextPeriod === REPORT_PERIOD_MONTH) {
      setSelectedMonth(getReportMonthKey());
    }

    setPeriod(nextPeriod);
  }

  function handleMonthChange(nextMonth: string) {
    setSelectedMonth(nextMonth);
    setPeriod(REPORT_PERIOD_MONTH);
    setIsMonthCalendarOpen(false);
  }

  function handleSpecificMonthOpen() {
    setIsMonthCalendarOpen(true);
  }

  function getDashboardDataTitle(periodLabel: string) {
    if (period === REPORT_PERIOD_YEAR) {
      return dashboardTexts.filters.periodOptions.year;
    }

    if (period === REPORT_PERIOD_ALL) {
      return dashboardTexts.filters.periodOptions.all;
    }

    return periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1);
  }

  return (
    <main aria-label={dashboardTexts.title}>
      <div className="min-h-screen bg-muted/30 px-6 py-8 text-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <header>
            <Heading level={1} size="page">
              {dashboardTexts.title}
            </Heading>
          </header>

          {error ? (
            <InlineAlert>
              {error instanceof Error
                ? error.message
                : dashboardTexts.api.errors.serverError}
            </InlineAlert>
          ) : null}

          {shouldShowInitialSkeleton ? <DashboardSkeleton /> : null}

          {!shouldShowInitialSkeleton && !error && dashboard ? (
            <>
              <DashboardPeriodFilter
                branchId={selectedBranchId}
                branchOptions={isOwner ? branchOptions : []}
                period={period}
                onBranchChange={setSelectedBranchId}
                onMonthPickerOpen={handleSpecificMonthOpen}
                onPeriodChange={handlePeriodChange}
              />

              {shouldShowDataSkeleton ? (
                <DashboardSkeleton />
              ) : (
                <Card title={getDashboardDataTitle(dashboard.periodLabel)}>
                  <section className="grid gap-4">
                    <div className="grid gap-4 lg:grid-cols-4">
                      {dashboard.metrics.map((metric) => (
                        <DashboardMetricCard
                          key={metric.label}
                          metric={metric}
                        />
                      ))}
                    </div>
                    <DashboardRevenueTrend data={dashboard.revenueTrend} />
                    <div className="grid gap-4 lg:grid-cols-2">
                      <DashboardTopList
                        items={dashboard.topBarbers}
                        title={dashboardTexts.sections.topBarbers}
                      />
                      <DashboardTopList
                        items={dashboard.topSkinners}
                        title={dashboardTexts.sections.topSkinners}
                      />
                      <DashboardTopList
                        items={dashboard.topServices}
                        title={dashboardTexts.sections.topServices}
                      />
                      <DashboardTopList
                        items={dashboard.topCombos}
                        title={dashboardTexts.sections.topCombos}
                      />
                    </div>
                    <DashboardHaircutWarnings
                      warnings={dashboard.haircutWarnings}
                    />
                  </section>
                </Card>
              )}
            </>
          ) : null}

          {!shouldShowInitialSkeleton && !error && !dashboard ? (
            <EmptyState icon={BarChart3} text={dashboardTexts.empty} />
          ) : null}
        </div>
      </div>

      <Modal
        open={isMonthCalendarOpen}
        title={dashboardTexts.filters.monthPickerLabel}
        onOpenChange={setIsMonthCalendarOpen}
      >
        <MonthCalendar
          label={dashboardTexts.filters.monthPickerLabel}
          max={maximumMonth}
          min={minimumMonth}
          value={selectedMonth}
          onValueChange={handleMonthChange}
        />
      </Modal>
    </main>
  );
}

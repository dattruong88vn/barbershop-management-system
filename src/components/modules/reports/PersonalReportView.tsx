"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";

import {
  BadgeButton,
  Checkbox,
  Heading,
  KeyValueRow,
  Modal,
  MonthCalendar,
  Skeleton,
} from "@/components/global";
import { AppMobileBottomNav } from "@/components/mobile/AppMobileBottomNav";
import { EmptyState } from "@/components/global/EmptyState";
import { InlineAlert } from "@/components/global/InlineAlert";
import {
  REPORT_PERIOD_ALL,
  REPORT_PERIOD_CURRENT_MONTH,
  REPORT_PERIOD_MONTH,
  REPORT_PERIOD_YEAR,
  type ReportPeriodValue,
} from "@/constants/common";
import { reportTexts } from "@/constants/texts";
import { usePersonalReport } from "@/hooks/usePersonalReport";
import {
  getMinimumReportMonthKey,
  getPersonalReportPeriodFilter,
  getReportMonthKey,
} from "@/utils/reports";

import { PersonalReportGeneralInfoCard } from "./PersonalReportGeneralInfoCard";
import { PersonalReportTopItems } from "./PersonalReportTopItems";
import { PersonalReportSkeleton } from "./PersonalReportSkeleton";

export function PersonalReportView() {
  const [period, setPeriod] = useState<ReportPeriodValue>(
    REPORT_PERIOD_CURRENT_MONTH,
  );
  const [selectedMonth, setSelectedMonth] = useState(getReportMonthKey());
  const [isMonthCalendarOpen, setIsMonthCalendarOpen] = useState(false);
  const reportFilter = getPersonalReportPeriodFilter({
    month: selectedMonth,
    period,
  });
  const { error, isFetching, isLoading, report } = usePersonalReport(reportFilter);
  const shouldShowInitialSkeleton = isLoading && !report;
  const shouldShowDataSkeleton = isFetching;
  const maximumMonth = getReportMonthKey();
  const minimumMonth = getMinimumReportMonthKey();

  function handlePeriodChange(nextPeriod: ReportPeriodValue) {
    if (nextPeriod === REPORT_PERIOD_CURRENT_MONTH) {
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

  return (
    <main aria-label={reportTexts.personal.title}>
      <div className="min-h-screen bg-muted/30 px-4 py-4 pb-20 text-foreground md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-3xl">
          <header className="mb-4 md:mb-6">
            <Heading level={1} size="page">
              {reportTexts.personal.title}
            </Heading>
          </header>

          {error ? (
            <InlineAlert className="mb-4">
              {error instanceof Error
                ? error.message
                : reportTexts.api.errors.serverError}
            </InlineAlert>
          ) : null}

          {shouldShowInitialSkeleton ? <PersonalReportSkeleton /> : null}

          {!shouldShowInitialSkeleton && !error && report ? (
            <>
              <section className="mb-4 rounded-xl border border-border bg-background p-4">
                <div className="grid gap-3">
                  <KeyValueRow
                    title={reportTexts.personal.fullNameLabel}
                    value={report.staffName}
                  />
                  <KeyValueRow
                    title={reportTexts.personal.roleLabel}
                    value={report.roleLabel}
                  />
                </div>
              </section>

              <section className="mb-4 rounded-xl border border-border bg-background p-4">
                <div className="grid gap-4">
                  <div>
                    <KeyValueRow
                      title={reportTexts.personal.periodTitle}
                      value={report.periodLabel}
                    />
                  </div>
                  <div className="border-t border-border" />
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(9rem,1.25fr)] gap-3">
                    <div>
                      <Checkbox
                        checked={period === REPORT_PERIOD_CURRENT_MONTH}
                        label={reportTexts.personal.periodOptions.currentMonth}
                        onChange={() =>
                          handlePeriodChange(REPORT_PERIOD_CURRENT_MONTH)
                        }
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Checkbox
                        checked={period === REPORT_PERIOD_MONTH}
                        label={reportTexts.personal.periodOptions.month}
                        onChange={handleSpecificMonthOpen}
                      />
                      <BadgeButton
                        className="min-h-0 py-0.5"
                        outline
                        size="sm"
                        variant="warning"
                        onClick={handleSpecificMonthOpen}
                      >
                        {reportTexts.personal.chooseSpecificMonth}
                      </BadgeButton>
                    </div>
                    <div>
                      <Checkbox
                        checked={period === REPORT_PERIOD_YEAR}
                        label={reportTexts.personal.periodOptions.year}
                        onChange={() => handlePeriodChange(REPORT_PERIOD_YEAR)}
                      />
                    </div>
                    <div>
                      <Checkbox
                        checked={period === REPORT_PERIOD_ALL}
                        label={reportTexts.personal.periodOptions.all}
                        onChange={() => handlePeriodChange(REPORT_PERIOD_ALL)}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-4">
                {shouldShowDataSkeleton ? (
                  <div className="grid gap-3">
                    <Skeleton className="h-32" variant="card" />
                    <Skeleton className="h-48" variant="card" />
                    <Skeleton className="h-48" variant="card" />
                  </div>
                ) : (
                  <div className="grid gap-6">
                    <PersonalReportGeneralInfoCard metrics={report.metrics} />
                    <PersonalReportTopItems items={report.topItems} />
                    <PersonalReportTopItems
                      items={report.topCustomers}
                      title={reportTexts.personal.topCustomerTitle}
                    />
                  </div>
                )}
              </section>
            </>
          ) : null}

          {!shouldShowInitialSkeleton && !error && !report ? (
            <EmptyState icon={BarChart3} text={reportTexts.personal.empty} />
          ) : null}
        </div>

        <AppMobileBottomNav activeItem="reports" />
      </div>

      <Modal
        open={isMonthCalendarOpen}
        title={reportTexts.personal.monthPickerLabel}
        onOpenChange={setIsMonthCalendarOpen}
      >
        <MonthCalendar
          label={reportTexts.personal.monthPickerLabel}
          max={maximumMonth}
          min={minimumMonth}
          value={selectedMonth}
          onValueChange={handleMonthChange}
        />
      </Modal>
    </main>
  );
}

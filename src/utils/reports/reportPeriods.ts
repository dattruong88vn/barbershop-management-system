import {
  REPORT_PERIOD_ALL,
  REPORT_PERIOD_CURRENT_MONTH,
  REPORT_PERIOD_MONTH,
  REPORT_PERIOD_YEAR,
  type ReportPeriodValue,
} from "@/constants/common";

const REPORT_MONTH_KEY_LENGTH = 7;
const REPORT_MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;

export function getReportMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function getMinimumReportMonthKey(date = new Date()) {
  return getReportMonthKey(new Date(date.getFullYear(), date.getMonth() - 11, 1));
}

export function getReportMonthDate(monthKey: string) {
  if (!REPORT_MONTH_KEY_PATTERN.test(monthKey)) {
    return null;
  }

  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, REPORT_MONTH_KEY_LENGTH));

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return new Date(year, month - 1, 1);
}

export function getPersonalReportPeriodFilter({
  month,
  period,
}: {
  month: string;
  period: ReportPeriodValue;
}): {
  month?: string;
  period: ReportPeriodValue;
} {
  if (period === REPORT_PERIOD_YEAR) {
    return { period: REPORT_PERIOD_YEAR };
  }

  if (period === REPORT_PERIOD_ALL) {
    return { period: REPORT_PERIOD_ALL };
  }

  if (period === REPORT_PERIOD_CURRENT_MONTH) {
    return {
      month: getReportMonthKey(),
      period: REPORT_PERIOD_MONTH,
    };
  }

  return {
    month,
    period: REPORT_PERIOD_MONTH,
  };
}

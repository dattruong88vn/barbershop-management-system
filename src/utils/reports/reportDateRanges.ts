const REPORT_TIME_ZONE_OFFSET = "+07:00";
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ReportDateRange = {
  end: Date;
  start: Date;
};

function isValidDateKey(value: string) {
  if (!DATE_KEY_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function getReportDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getReportDateFromKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function getCurrentMonthReportDateRange() {
  const today = new Date();
  const fromDate = getReportDateKey(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  return {
    fromDate,
    toDate: getReportDateKey(today),
  };
}

export function parseReportDateRange({
  fromDate,
  toDate,
}: {
  fromDate: string;
  toDate: string;
}): ReportDateRange | null {
  if (
    !isValidDateKey(fromDate) ||
    !isValidDateKey(toDate) ||
    fromDate > toDate
  ) {
    return null;
  }

  const start = new Date(`${fromDate}T00:00:00${REPORT_TIME_ZONE_OFFSET}`);
  const end = new Date(`${toDate}T00:00:00${REPORT_TIME_ZONE_OFFSET}`);
  end.setUTCDate(end.getUTCDate() + 1);

  return { end, start };
}

export function formatReportDateRangeLabel(fromDate: string, toDate: string) {
  const formatDateKey = (value: string) => value.split("-").reverse().join("/");

  return `${formatDateKey(fromDate)} - ${formatDateKey(toDate)}`;
}

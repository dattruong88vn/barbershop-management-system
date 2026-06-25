import { DateRangePicker } from "@/components/global";
import { reportTexts } from "@/constants/texts";
import {
  getReportDateFromKey,
  getReportDateKey,
} from "@/utils/reports";

type ReportDateRangeFilterProps = {
  fromDate: string;
  maximumDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  toDate: string;
};

export function ReportDateRangeFilter({
  fromDate,
  maximumDate,
  onFromDateChange,
  onToDateChange,
  toDate,
}: ReportDateRangeFilterProps) {
  return (
    <DateRangePicker
      fromDateLabel={reportTexts.dateRange.fromDateLabel}
      label={reportTexts.dateRange.label}
      maxDate={getReportDateFromKey(maximumDate)}
      toDateLabel={reportTexts.dateRange.toDateLabel}
      value={{
        fromDate: getReportDateFromKey(fromDate),
        toDate: getReportDateFromKey(toDate),
      }}
      onChange={(value) => {
        onFromDateChange(getReportDateKey(value.fromDate));
        onToDateChange(getReportDateKey(value.toDate));
      }}
    />
  );
}

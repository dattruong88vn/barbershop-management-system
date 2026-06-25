import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { reportTexts } from "@/constants/texts";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  StaffReportApiResponse,
  StaffReportData,
  StaffReportDetailApiResponse,
  StaffReportDetailData,
  StaffReportDetailFilter,
  StaffReportFilter,
} from "@/types";

const STAFF_REPORT_QUERY_KEY = ["staff-report"] as const;
const STAFF_REPORT_DETAIL_QUERY_KEY = ["staff-report-detail"] as const;
const STAFF_REPORT_RESPONSE_DATA_KEY = "report";
const STAFF_REPORT_DETAIL_STALE_TIME_MS = 5 * 60 * 1000;

function getStaffReportResponseData<TReport>(
  result: { error?: string; report?: TReport },
): TReport {
  if (
    !hasResponseData<typeof STAFF_REPORT_RESPONSE_DATA_KEY, TReport>(
      result,
      STAFF_REPORT_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? reportTexts.api.errors.serverError);
  }

  return result.report;
}

async function getStaffReport(
  filter: StaffReportFilter,
): Promise<StaffReportData> {
  const result = await fetchClient<StaffReportApiResponse>(
    API_ROUTES.staffReport(filter),
  );

  return getStaffReportResponseData<StaffReportData>(result);
}

async function getStaffReportDetails(
  filter: StaffReportDetailFilter,
): Promise<StaffReportDetailData> {
  const result = await fetchClient<StaffReportDetailApiResponse>(
    API_ROUTES.staffReportDetails(filter),
  );

  return getStaffReportResponseData<StaffReportDetailData>(result);
}

export function useStaffReport(filter: StaffReportFilter) {
  const reportQuery = useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => getStaffReport(filter),
    queryKey: [
      ...STAFF_REPORT_QUERY_KEY,
      filter.fromDate,
      filter.toDate,
      filter.branchId,
      filter.role,
      filter.search,
    ],
  });

  return {
    error: reportQuery.error,
    isFetching: reportQuery.isFetching,
    isLoading: reportQuery.isLoading,
    report: reportQuery.data ?? null,
  };
}

export function useStaffReportDetails(
  filter: StaffReportDetailFilter,
  enabled: boolean,
) {
  const reportQuery = useQuery({
    enabled,
    placeholderData: keepPreviousData,
    queryFn: () => getStaffReportDetails(filter),
    queryKey: [
      ...STAFF_REPORT_DETAIL_QUERY_KEY,
      filter.staffId,
      filter.fromDate,
      filter.toDate,
      filter.branchId,
      filter.role,
      filter.search,
      filter.page,
      filter.pageSize,
    ],
    staleTime: STAFF_REPORT_DETAIL_STALE_TIME_MS,
  });

  return {
    error: reportQuery.error,
    isFetching: reportQuery.isFetching,
    isLoading: reportQuery.isLoading,
    refetch: reportQuery.refetch,
    report: reportQuery.data ?? null,
  };
}

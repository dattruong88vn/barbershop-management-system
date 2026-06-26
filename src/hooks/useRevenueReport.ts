import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { reportTexts } from "@/constants/texts";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  RevenueReportApiResponse,
  RevenueReportData,
  RevenueReportDetailApiResponse,
  RevenueReportDetailData,
  RevenueReportDetailFilter,
  RevenueReportFilter,
} from "@/types";

const REVENUE_REPORT_QUERY_KEY = ["revenue-report"] as const;
const REVENUE_REPORT_DETAIL_QUERY_KEY = ["revenue-report-detail"] as const;
const REVENUE_REPORT_RESPONSE_DATA_KEY = "report";
const REVENUE_REPORT_STALE_TIME_MS = 5 * 60 * 1000;
const REVENUE_REPORT_DETAIL_STALE_TIME_MS = 5 * 60 * 1000;
const REVENUE_REPORT_GC_TIME_MS = 30 * 60 * 1000;

function getRevenueReportResponseData<TReport>(
  result: { error?: string; report?: TReport },
): TReport {
  if (
    !hasResponseData<typeof REVENUE_REPORT_RESPONSE_DATA_KEY, TReport>(
      result,
      REVENUE_REPORT_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? reportTexts.api.errors.serverError);
  }

  return result.report;
}

async function getRevenueReport(
  filter: RevenueReportFilter,
): Promise<RevenueReportData> {
  const result = await fetchClient<RevenueReportApiResponse>(
    API_ROUTES.revenueReport(filter),
  );

  return getRevenueReportResponseData<RevenueReportData>(result);
}

async function getRevenueReportDetails(
  filter: RevenueReportDetailFilter,
): Promise<RevenueReportDetailData> {
  const result = await fetchClient<RevenueReportDetailApiResponse>(
    API_ROUTES.revenueReportDetails(filter),
  );

  return getRevenueReportResponseData<RevenueReportDetailData>(result);
}

export function useRevenueReport(filter: RevenueReportFilter) {
  const reportQuery = useQuery({
    queryFn: () => getRevenueReport(filter),
    queryKey: [
      ...REVENUE_REPORT_QUERY_KEY,
      filter.tab,
      filter.fromDate,
      filter.toDate,
    ],
    gcTime: REVENUE_REPORT_GC_TIME_MS,
    staleTime: REVENUE_REPORT_STALE_TIME_MS,
  });

  return {
    error: reportQuery.error,
    isFetching: reportQuery.isFetching,
    isLoading: reportQuery.isLoading,
    report: reportQuery.data ?? null,
  };
}

export function useRevenueReportDetails(
  filter: RevenueReportDetailFilter,
  enabled: boolean,
) {
  const reportQuery = useQuery({
    enabled,
    placeholderData: keepPreviousData,
    queryFn: () => getRevenueReportDetails(filter),
    queryKey: [
      ...REVENUE_REPORT_DETAIL_QUERY_KEY,
      filter.tab,
      filter.drilldownId,
      filter.itemType,
      filter.fromDate,
      filter.toDate,
      filter.page,
      filter.pageSize,
    ],
    gcTime: REVENUE_REPORT_GC_TIME_MS,
    staleTime: REVENUE_REPORT_DETAIL_STALE_TIME_MS,
  });

  return {
    error: reportQuery.error,
    isFetching: reportQuery.isFetching,
    isLoading: reportQuery.isLoading,
    refetch: reportQuery.refetch,
    report: reportQuery.data ?? null,
  };
}

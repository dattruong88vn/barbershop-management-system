import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { reportTexts } from "@/constants/texts";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  ServiceComboReportApiResponse,
  ServiceComboReportData,
  ServiceComboReportDetailApiResponse,
  ServiceComboReportDetailData,
  ServiceComboReportDetailFilter,
  ServiceComboReportFilter,
} from "@/types";

const SERVICE_COMBO_REPORT_QUERY_KEY = ["service-combo-report"] as const;
const SERVICE_COMBO_REPORT_DETAIL_QUERY_KEY = [
  "service-combo-report-detail",
] as const;
const SERVICE_COMBO_REPORT_RESPONSE_DATA_KEY = "report";
const SERVICE_COMBO_REPORT_STALE_TIME_MS = 5 * 60 * 1000;
const SERVICE_COMBO_REPORT_DETAIL_STALE_TIME_MS = 5 * 60 * 1000;
const SERVICE_COMBO_REPORT_GC_TIME_MS = 30 * 60 * 1000;

function getServiceComboReportResponseData<TReport>(
  result: { error?: string; report?: TReport },
): TReport {
  if (
    !hasResponseData<typeof SERVICE_COMBO_REPORT_RESPONSE_DATA_KEY, TReport>(
      result,
      SERVICE_COMBO_REPORT_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? reportTexts.api.errors.serverError);
  }

  return result.report;
}

async function getServiceComboReport(
  filter: ServiceComboReportFilter,
): Promise<ServiceComboReportData> {
  const result = await fetchClient<ServiceComboReportApiResponse>(
    API_ROUTES.serviceComboReport(filter),
  );

  return getServiceComboReportResponseData<ServiceComboReportData>(result);
}

async function getServiceComboReportDetails(
  filter: ServiceComboReportDetailFilter,
): Promise<ServiceComboReportDetailData> {
  const result = await fetchClient<ServiceComboReportDetailApiResponse>(
    API_ROUTES.serviceComboReportDetails(filter),
  );

  return getServiceComboReportResponseData<ServiceComboReportDetailData>(result);
}

export function useServiceComboReport(filter: ServiceComboReportFilter) {
  const reportQuery = useQuery({
    queryFn: () => getServiceComboReport(filter),
    queryKey: [
      ...SERVICE_COMBO_REPORT_QUERY_KEY,
      filter.tab,
      filter.fromDate,
      filter.toDate,
      filter.branchId,
      filter.responsibleRole,
      filter.search,
      filter.sort,
    ],
    staleTime: SERVICE_COMBO_REPORT_STALE_TIME_MS,
    gcTime: SERVICE_COMBO_REPORT_GC_TIME_MS,
  });

  return {
    error: reportQuery.error,
    isFetching: reportQuery.isFetching,
    isLoading: reportQuery.isLoading,
    report: reportQuery.data ?? null,
  };
}

export function useServiceComboReportDetails(
  filter: ServiceComboReportDetailFilter,
  enabled: boolean,
) {
  const reportQuery = useQuery({
    enabled,
    placeholderData: keepPreviousData,
    queryFn: () => getServiceComboReportDetails(filter),
    queryKey: [
      ...SERVICE_COMBO_REPORT_DETAIL_QUERY_KEY,
      filter.itemId,
      filter.tab,
      filter.fromDate,
      filter.toDate,
      filter.branchId,
      filter.responsibleRole,
      filter.search,
      filter.sort,
      filter.page,
      filter.pageSize,
    ],
    gcTime: SERVICE_COMBO_REPORT_GC_TIME_MS,
    staleTime: SERVICE_COMBO_REPORT_DETAIL_STALE_TIME_MS,
  });

  return {
    error: reportQuery.error,
    isFetching: reportQuery.isFetching,
    isLoading: reportQuery.isLoading,
    refetch: reportQuery.refetch,
    report: reportQuery.data ?? null,
  };
}

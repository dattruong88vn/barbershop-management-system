import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { reportTexts } from "@/constants/texts";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  BranchReportApiResponse,
  BranchReportData,
  BranchReportDetailApiResponse,
  BranchReportDetailData,
  BranchReportDetailFilter,
  BranchReportFilter,
} from "@/types";

const BRANCH_REPORT_QUERY_KEY = ["branch-report"] as const;
const BRANCH_REPORT_DETAIL_QUERY_KEY = ["branch-report-detail"] as const;
const BRANCH_REPORT_RESPONSE_DATA_KEY = "report";
const BRANCH_REPORT_DETAIL_STALE_TIME_MS = 5 * 60 * 1000;

function getBranchReportResponseData<TReport>(
  result: { error?: string; report?: TReport },
): TReport {
  if (
    !hasResponseData<typeof BRANCH_REPORT_RESPONSE_DATA_KEY, TReport>(
      result,
      BRANCH_REPORT_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? reportTexts.api.errors.serverError);
  }

  return result.report;
}

async function getBranchReport(
  filter: BranchReportFilter,
): Promise<BranchReportData> {
  const result = await fetchClient<BranchReportApiResponse>(
    API_ROUTES.branchReport(filter),
  );

  return getBranchReportResponseData<BranchReportData>(result);
}

async function getBranchReportDetails(
  filter: BranchReportDetailFilter,
): Promise<BranchReportDetailData> {
  const result = await fetchClient<BranchReportDetailApiResponse>(
    API_ROUTES.branchReportDetails(filter),
  );

  return getBranchReportResponseData<BranchReportDetailData>(result);
}

export function useBranchReport(filter: BranchReportFilter) {
  const reportQuery = useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => getBranchReport(filter),
    queryKey: [
      ...BRANCH_REPORT_QUERY_KEY,
      filter.fromDate,
      filter.toDate,
      filter.status,
    ],
  });

  return {
    error: reportQuery.error,
    isFetching: reportQuery.isFetching,
    isLoading: reportQuery.isLoading,
    report: reportQuery.data ?? null,
  };
}

export function useBranchReportDetails(
  filter: BranchReportDetailFilter,
  enabled: boolean,
) {
  const reportQuery = useQuery({
    enabled,
    placeholderData: keepPreviousData,
    queryFn: () => getBranchReportDetails(filter),
    queryKey: [
      ...BRANCH_REPORT_DETAIL_QUERY_KEY,
      filter.branchId,
      filter.fromDate,
      filter.toDate,
      filter.status,
      filter.page,
      filter.pageSize,
    ],
    staleTime: BRANCH_REPORT_DETAIL_STALE_TIME_MS,
  });

  return {
    error: reportQuery.error,
    isFetching: reportQuery.isFetching,
    isLoading: reportQuery.isLoading,
    refetch: reportQuery.refetch,
    report: reportQuery.data ?? null,
  };
}

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { reportTexts } from "@/constants/texts";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  PersonalReportApiResponse,
  PersonalReportData,
  PersonalReportFilter,
} from "@/types";

const PERSONAL_REPORT_QUERY_KEY = ["personal-report"] as const;
const PERSONAL_REPORT_RESPONSE_DATA_KEY = "report";

function getPersonalReportResponseData(
  result: PersonalReportApiResponse,
): PersonalReportData {
  if (
    !hasResponseData<typeof PERSONAL_REPORT_RESPONSE_DATA_KEY, PersonalReportData>(
      result,
      PERSONAL_REPORT_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? reportTexts.api.errors.serverError);
  }

  return result.report;
}

async function getPersonalReport(
  filter: PersonalReportFilter,
): Promise<PersonalReportData> {
  const result = await fetchClient<PersonalReportApiResponse>(
    API_ROUTES.personalReport(filter),
  );

  return getPersonalReportResponseData(result);
}

export function usePersonalReport(filter: PersonalReportFilter) {
  const reportQuery = useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => getPersonalReport(filter),
    queryKey: [...PERSONAL_REPORT_QUERY_KEY, filter.period, filter.month],
  });

  return {
    error: reportQuery.error,
    isFetching: reportQuery.isFetching,
    isLoading: reportQuery.isLoading,
    report: reportQuery.data ?? null,
  };
}

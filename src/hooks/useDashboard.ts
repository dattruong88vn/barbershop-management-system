import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { dashboardTexts } from "@/constants/texts";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  DashboardApiResponse,
  DashboardData,
  DashboardFilter,
} from "@/types";

const DASHBOARD_QUERY_KEY = ["dashboard"] as const;
const DASHBOARD_RESPONSE_DATA_KEY = "dashboard";

function getDashboardResponseData(
  result: DashboardApiResponse,
): DashboardData {
  if (
    !hasResponseData<typeof DASHBOARD_RESPONSE_DATA_KEY, DashboardData>(
      result,
      DASHBOARD_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? dashboardTexts.api.errors.serverError);
  }

  return result.dashboard;
}

async function getDashboard(filter: DashboardFilter): Promise<DashboardData> {
  const result = await fetchClient<DashboardApiResponse>(
    API_ROUTES.dashboard(filter),
  );

  return getDashboardResponseData(result);
}

export function useDashboard(filter: DashboardFilter) {
  const dashboardQuery = useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => getDashboard(filter),
    queryKey: [
      ...DASHBOARD_QUERY_KEY,
      filter.period,
      filter.month,
      filter.branchId,
    ],
  });

  return {
    dashboard: dashboardQuery.data ?? null,
    error: dashboardQuery.error,
    isFetching: dashboardQuery.isFetching,
    isLoading: dashboardQuery.isLoading,
  };
}

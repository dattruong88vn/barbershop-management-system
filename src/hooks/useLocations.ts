import { useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { locationTexts } from "@/constants/texts";
import { hasResponseData } from "@/lib/apiResponse";
import { fetchClient } from "@/lib/fetchClient";
import type {
  Province,
  ProvincesApiResponse,
  Ward,
  WardsApiResponse,
} from "@/types";

const LOCATIONS_QUERY_KEY = ["locations"] as const;
const PROVINCES_RESPONSE_DATA_KEY = "provinces";
const WARDS_RESPONSE_DATA_KEY = "wards";

async function getProvinces(): Promise<Province[]> {
  const result = await fetchClient<ProvincesApiResponse>(
    API_ROUTES.locationProvinces,
  );

  if (
    !hasResponseData<typeof PROVINCES_RESPONSE_DATA_KEY, Province[]>(
      result,
      PROVINCES_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? locationTexts.api.errors.unavailable);
  }

  return result.provinces;
}

async function getWards(provinceCode: string): Promise<Ward[]> {
  const result = await fetchClient<WardsApiResponse>(
    API_ROUTES.locationWards(provinceCode),
  );

  if (
    !hasResponseData<typeof WARDS_RESPONSE_DATA_KEY, Ward[]>(
      result,
      WARDS_RESPONSE_DATA_KEY,
    )
  ) {
    throw new Error(result.error ?? locationTexts.api.errors.unavailable);
  }

  return result.wards;
}

export function useLocations(currentProvinceCode: string) {
  const provincesQuery = useQuery({
    queryKey: [...LOCATIONS_QUERY_KEY, "provinces"],
    queryFn: getProvinces,
  });
  const wardsQuery = useQuery({
    queryKey: [...LOCATIONS_QUERY_KEY, "wards", currentProvinceCode],
    queryFn: () => getWards(currentProvinceCode),
    enabled: Boolean(currentProvinceCode),
  });

  return {
    provinces: provincesQuery.data ?? [],
    provincesError: provincesQuery.error,
    isLoadingProvinces: provincesQuery.isLoading,
    wards: wardsQuery.data ?? [],
    wardsError: wardsQuery.error,
    isLoadingWards: wardsQuery.isLoading,
  };
}

import { useMutation } from "@tanstack/react-query";

import { API_ROUTES } from "@/constants/routes";
import { authTexts } from "@/constants/texts";
import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";
import { fetchClient } from "@/lib/fetchClient";
import type {
  ChangePasswordApiResponse,
  ChangePasswordInput,
  ChangePasswordResult,
} from "@/types";

function isChangePasswordResult(
  response: ChangePasswordApiResponse,
): response is ChangePasswordResult {
  return (
    typeof response.username === "string" &&
    typeof response.redirectTo === "string"
  );
}

async function changePassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  const result = await fetchClient<ChangePasswordApiResponse>(
    API_ROUTES.changePassword,
    {
      method: "POST",
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify(input),
    },
  );

  if (!isChangePasswordResult(result)) {
    throw new Error(result.error ?? authTexts.changePassword.errors.generic);
  }

  return result;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

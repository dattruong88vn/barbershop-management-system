import { ROUTES } from "@/constants/routes";
import { commonTexts } from "@/constants/texts";
import type { ApiErrorResponse, ApiRequestOptions } from "@/types";

async function parseApiResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return {};
  }

  return response.json();
}

function isApiErrorResponse(
  responseBody: unknown,
): responseBody is ApiErrorResponse {
  return typeof responseBody === "object" && responseBody !== null;
}

function getApiErrorMessage(responseBody: unknown): string {
  if (!isApiErrorResponse(responseBody)) {
    return commonTexts.api.errors.requestFailed;
  }

  return (
    (typeof responseBody.message === "string" ? responseBody.message : null) ??
    (typeof responseBody.error === "string" ? responseBody.error : null) ??
    commonTexts.api.errors.requestFailed
  );
}

export async function fetchClient<TResponse>(
  url: string,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  const response = await fetch(url, options);
  const responseBody = await parseApiResponse(response);

  if (response.status === 401) {
    window.location.assign(ROUTES.login);
    throw new Error(commonTexts.api.errors.unauthorized);
  }

  if (response.status === 403) {
    window.location.assign(ROUTES.dashboard);
    throw new Error(commonTexts.api.errors.forbidden);
  }

  if (response.status === 404) {
    window.location.assign(ROUTES.notFound);
    throw new Error(commonTexts.api.errors.notFound);
  }

  if (response.status === 500) {
    throw new Error(commonTexts.api.errors.serverError);
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(responseBody));
  }

  return responseBody as TResponse;
}

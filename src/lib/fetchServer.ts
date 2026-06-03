import { notFound, redirect } from "next/navigation";

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
    return commonTexts.api.errors.serverError;
  }

  return (
    (typeof responseBody.message === "string" ? responseBody.message : null) ??
    (typeof responseBody.error === "string" ? responseBody.error : null) ??
    commonTexts.api.errors.serverError
  );
}

export async function fetchServer<TResponse>(
  url: string,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  const response = await fetch(url, { cache: "no-store", ...options });
  const responseBody = await parseApiResponse(response);

  if (response.status === 401) {
    redirect(ROUTES.login);
  }

  if (response.status === 403) {
    redirect(ROUTES.dashboard);
  }

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(responseBody));
  }

  return responseBody as TResponse;
}

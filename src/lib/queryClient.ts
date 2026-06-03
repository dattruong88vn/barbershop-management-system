import {
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";

import { commonTexts } from "@/constants/texts";

export const API_SERVER_ERROR_EVENT = "api-server-error";

function handleApiServerError(error: unknown) {
  if (
    error instanceof Error &&
    error.message === commonTexts.api.errors.serverError
  ) {
    window.dispatchEvent(
      new CustomEvent(API_SERVER_ERROR_EVENT, {
        detail: commonTexts.api.errors.serverErrorToast,
      }),
    );
  }
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleApiServerError,
    }),
    mutationCache: new MutationCache({
      onError: handleApiServerError,
    }),
    defaultOptions: {
      queries: {
        retry: 1,
      },
    },
  });
}

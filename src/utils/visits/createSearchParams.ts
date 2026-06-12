import type { Customer, VisitCreateSuggestions } from "@/types";

export type VisitCreateSearchParams = {
  customerId?: string;
  barberId?: string;
  comboIds?: string;
  name?: string;
  phone?: string;
  returnToCustomerId?: string;
  serviceIds?: string;
  skinnerId?: string;
};

function getIdsFromSearchParam(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function getCustomerFromVisitCreateSearchParams({
  customerId,
  name,
  phone,
}: VisitCreateSearchParams): Customer | null {
  if (!customerId || !name || !phone) {
    return null;
  }

  return {
    createdAt: "",
    id: customerId,
    lastVisit: null,
    name,
    phone,
    shopId: "",
  };
}

export function getVisitSuggestionsFromSearchParams({
  barberId,
  comboIds,
  serviceIds,
  skinnerId,
}: VisitCreateSearchParams): VisitCreateSuggestions | null {
  const serviceSuggestions = getIdsFromSearchParam(serviceIds).map((itemId) => ({
    itemId,
    type: "service" as const,
  }));
  const comboSuggestions = getIdsFromSearchParam(comboIds).map((itemId) => ({
    itemId,
    type: "combo" as const,
  }));

  if (
    !serviceSuggestions.length &&
    !comboSuggestions.length &&
    !barberId &&
    !skinnerId
  ) {
    return null;
  }

  return {
    barber: barberId ? { id: barberId } : null,
    services: comboSuggestions.length
      ? comboSuggestions
      : serviceSuggestions,
    skinner: skinnerId ? { id: skinnerId } : null,
  };
}

import { visitTexts } from "@/constants/texts";
import { VISIT_STATUS_COMPLETED } from "@/constants/visitStatuses";
import type {
  CustomerVisit,
  VisitCreateFormProps,
  VisitCreateItem,
} from "@/types";

const STAFF_EDIT_WINDOW_MS = 3 * 60 * 60 * 1000;

export function canEditVisitStaff(visit: CustomerVisit) {
  if (visit.status !== VISIT_STATUS_COMPLETED || !visit.completedAt) {
    return false;
  }

  return Date.now() <= new Date(visit.completedAt).getTime() + STAFF_EDIT_WINDOW_MS;
}

export function calculateVisitTotalPrice(
  selectedServiceIds: string[],
  selectedComboIds: string[],
  services: VisitCreateItem[],
  combos: VisitCreateItem[],
) {
  const selectedServicesTotal = services
    .filter((service) => selectedServiceIds.includes(service.id))
    .reduce((total, service) => total + service.price, 0);
  const selectedCombosTotal = combos
    .filter((combo) => selectedComboIds.includes(combo.id))
    .reduce((total, combo) => total + combo.price, 0);

  return selectedServicesTotal + selectedCombosTotal;
}

export function getSuggestedVisitItemIds(
  suggestions: VisitCreateFormProps["suggestions"],
  type: "service" | "combo",
) {
  return (
    suggestions?.services
      .filter((service) => service.type === type && service.itemId)
      .map((service) => service.itemId as string) ?? []
  );
}

export function getVisitItemIds(
  visit: CustomerVisit,
  type: "service" | "combo",
) {
  return visit.services
    .filter((service) => service.type === type && service.itemId)
    .map((service) => service.itemId as string);
}

export function mergeVisitItems(
  items: VisitCreateItem[],
  visit: CustomerVisit,
  type: "service" | "combo",
) {
  const itemMap = new Map(items.map((item) => [item.id, item]));

  visit.services
    .filter((service) => service.type === type && service.itemId)
    .forEach((service) => {
      if (service.itemId && !itemMap.has(service.itemId)) {
        itemMap.set(service.itemId, {
          id: service.itemId,
          name: service.name,
          price: service.price,
        });
      }
    });

  return Array.from(itemMap.values());
}

export function getMissingCompletionStaffMessage(visit: CustomerVisit) {
  const isMissingBarber = !visit.barber && !visit.noHaircut;
  const isMissingSkinner = !visit.skinner && !visit.noSkinnerService;

  return isMissingBarber || isMissingSkinner
    ? visitTexts.api.errors.missingCompletionStaff
    : "";
}

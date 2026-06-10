"use client";

import type { SyntheticEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { InlineAlert } from "@/components/global/InlineAlert";
import { Button } from "@/components/global/ui/button";
import { ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import { useVisits } from "@/hooks/useVisits";
import { dispatchAppToast } from "@/lib/toast";
import type { VisitCreateFormProps, VisitCreateItem } from "@/types";
import {
  VisitCreateItemSelector,
  VisitCreateStaffSelect,
} from "./VisitCreateFormFields";

const PRICE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

function getSuggestedIds(
  suggestions: VisitCreateFormProps["suggestions"],
  type: "service" | "combo",
) {
  return (
    suggestions?.services
      .filter((service) => service.type === type && service.itemId)
      .map((service) => service.itemId as string) ?? []
  );
}

function calculateTotalPrice(
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

function toggleId(selectedIds: string[], id: string) {
  return selectedIds.includes(id)
    ? selectedIds.filter((selectedId) => selectedId !== id)
    : [...selectedIds, id];
}

export default function VisitCreateForm({
  customerId,
  returnToCustomerId,
  suggestions,
}: VisitCreateFormProps) {
  const router = useRouter();
  const suggestedComboIds = getSuggestedIds(suggestions, "combo");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() =>
    suggestedComboIds.length ? [] : getSuggestedIds(suggestions, "service"),
  );
  const [selectedComboIds, setSelectedComboIds] = useState<string[]>(
    suggestedComboIds,
  );
  const [barberId, setBarberId] = useState(suggestions?.barber?.id ?? "");
  const [skinnerId, setSkinnerId] = useState(suggestions?.skinner?.id ?? "");
  const [error, setError] = useState("");
  const {
    barbers,
    combos,
    createVisit,
    error: optionsError,
    isCreating,
    isLoadingOptions,
    services,
    skinners,
  } = useVisits();

  const totalPrice = useMemo(
    () =>
      calculateTotalPrice(selectedServiceIds, selectedComboIds, services, combos),
    [combos, selectedComboIds, selectedServiceIds, services],
  );

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedServiceIds.length && !selectedComboIds.length) {
      setError(visitTexts.create.errors.missingItems);
      return;
    }

    if (selectedServiceIds.length && selectedComboIds.length) {
      setError(visitTexts.create.errors.mixedItems);
      return;
    }

    try {
      const visit = await createVisit({
        customerId,
        serviceIds: selectedServiceIds,
        comboIds: selectedComboIds,
        barberId: barberId || null,
        skinnerId: skinnerId || null,
      });
      if (visit.id) {
        dispatchAppToast({
          description: visitTexts.create.successDescription,
          message: visitTexts.create.success,
          type: "success",
        });
        router.push(
          returnToCustomerId
            ? ROUTES.visitDetailFromCustomer(visit.id, returnToCustomerId)
            : ROUTES.visitDetail(visit.id),
        );
      }
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : visitTexts.create.errors.generic,
      );
    }
  }

  return (
    <section
      id="create-visit"
      className="mt-4 scroll-mt-6 rounded-xl border border-border bg-background p-5"
    >
      <h2 className="text-base font-semibold text-foreground">
        {visitTexts.create.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {visitTexts.create.description}
      </p>

      {isLoadingOptions ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {visitTexts.create.loadingOptions}
        </p>
      ) : null}

      {optionsError ? (
        <InlineAlert className="mt-4">
          {optionsError instanceof Error
            ? optionsError.message
            : visitTexts.create.errors.generic}
        </InlineAlert>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <VisitCreateItemSelector
          emptyText={visitTexts.create.emptyServices}
          items={services}
          label={visitTexts.create.servicesLabel}
          selectedIds={selectedServiceIds}
          onToggleItem={(serviceId) => {
            setSelectedComboIds([]);
            setSelectedServiceIds((currentIds) =>
              toggleId(currentIds, serviceId),
            );
          }}
        />

        <VisitCreateItemSelector
          emptyText={visitTexts.create.emptyCombos}
          items={combos}
          label={visitTexts.create.combosLabel}
          selectedIds={selectedComboIds}
          onToggleItem={(comboId) => {
            setSelectedServiceIds([]);
            setSelectedComboIds((currentIds) => toggleId(currentIds, comboId));
          }}
        />

        <VisitCreateStaffSelect
          label={visitTexts.create.barberLabel}
          noStaffOption={visitTexts.create.noStaffOption}
          staff={barbers}
          value={barberId}
          onChange={(event) => setBarberId(event.target.value)}
        />

        <VisitCreateStaffSelect
          label={visitTexts.create.skinnerLabel}
          noStaffOption={visitTexts.create.noStaffOption}
          staff={skinners}
          value={skinnerId}
          onChange={(event) => setSkinnerId(event.target.value)}
        />

        <p className="rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground">
          <span>{visitTexts.create.totalPriceLabel}</span>
          <span className="ml-2">{PRICE_FORMATTER.format(totalPrice)}</span>
        </p>

        {error ? <InlineAlert>{error}</InlineAlert> : null}

        <Button
          type="submit"
          disabled={isCreating}
          variant="primary"
          className="h-11 w-full rounded-lg disabled:cursor-not-allowed"
        >
          {isCreating ? visitTexts.create.creating : visitTexts.create.submit}
        </Button>
      </form>
    </section>
  );
}

"use client";

import type { SyntheticEvent } from "react";
import { useMemo, useState } from "react";

import { InlineAlert } from "@/components/design-system/InlineAlert";
import { Button } from "@/components/ui/button";
import { visitTexts } from "@/constants/texts";
import { useVisits } from "@/hooks/useVisits";
import type { VisitCreateFormProps, VisitCreateItem } from "@/types";

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
  suggestions,
}: VisitCreateFormProps) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() =>
    getSuggestedIds(suggestions, "service"),
  );
  const [selectedComboIds, setSelectedComboIds] = useState<string[]>(() =>
    getSuggestedIds(suggestions, "combo"),
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

    try {
      await createVisit({
        customerId,
        serviceIds: selectedServiceIds,
        comboIds: selectedComboIds,
        barberId: barberId || null,
        skinnerId: skinnerId || null,
      });
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
        <fieldset>
          <legend className="text-sm font-medium text-foreground">
            {visitTexts.create.servicesLabel}
          </legend>
          {services.length ? (
            <div className="mt-2 space-y-2">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(service.id)}
                      onChange={() =>
                        setSelectedServiceIds((currentIds) =>
                          toggleId(currentIds, service.id),
                        )
                      }
                      className="h-4 w-4 rounded border-border"
                    />
                    <span>{service.name}</span>
                  </span>
                  <span className="font-medium text-muted-foreground">
                    {PRICE_FORMATTER.format(service.price)}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {visitTexts.create.emptyServices}
            </p>
          )}
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-foreground">
            {visitTexts.create.combosLabel}
          </legend>
          {combos.length ? (
            <div className="mt-2 space-y-2">
              {combos.map((combo) => (
                <label
                  key={combo.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedComboIds.includes(combo.id)}
                      onChange={() =>
                        setSelectedComboIds((currentIds) =>
                          toggleId(currentIds, combo.id),
                        )
                      }
                      className="h-4 w-4 rounded border-border"
                    />
                    <span>{combo.name}</span>
                  </span>
                  <span className="font-medium text-muted-foreground">
                    {PRICE_FORMATTER.format(combo.price)}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {visitTexts.create.emptyCombos}
            </p>
          )}
        </fieldset>

        <label className="block">
          <span className="text-sm font-medium text-foreground">
            {visitTexts.create.barberLabel}
          </span>
          <select
            value={barberId}
            onChange={(event) => setBarberId(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring"
          >
            <option value="">{visitTexts.create.noStaffOption}</option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.username}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">
            {visitTexts.create.skinnerLabel}
          </span>
          <select
            value={skinnerId}
            onChange={(event) => setSkinnerId(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring"
          >
            <option value="">{visitTexts.create.noStaffOption}</option>
            {skinners.map((skinner) => (
              <option key={skinner.id} value={skinner.id}>
                {skinner.username}
              </option>
            ))}
          </select>
        </label>

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

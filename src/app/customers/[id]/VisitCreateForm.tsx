"use client";

import type { SyntheticEvent } from "react";
import { useMemo, useState } from "react";

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
      className="mt-4 scroll-mt-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-base font-semibold">{visitTexts.create.title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        {visitTexts.create.description}
      </p>

      {isLoadingOptions ? (
        <p className="mt-4 text-sm text-zinc-600">
          {visitTexts.create.loadingOptions}
        </p>
      ) : null}

      {optionsError ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {optionsError instanceof Error
            ? optionsError.message
            : visitTexts.create.errors.generic}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <fieldset>
          <legend className="text-sm font-medium text-zinc-800">
            {visitTexts.create.servicesLabel}
          </legend>
          {services.length ? (
            <div className="mt-2 space-y-2">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2 text-sm"
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
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    <span>{service.name}</span>
                  </span>
                  <span className="font-medium text-zinc-700">
                    {PRICE_FORMATTER.format(service.price)}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-600">
              {visitTexts.create.emptyServices}
            </p>
          )}
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-zinc-800">
            {visitTexts.create.combosLabel}
          </legend>
          {combos.length ? (
            <div className="mt-2 space-y-2">
              {combos.map((combo) => (
                <label
                  key={combo.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2 text-sm"
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
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    <span>{combo.name}</span>
                  </span>
                  <span className="font-medium text-zinc-700">
                    {PRICE_FORMATTER.format(combo.price)}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-600">
              {visitTexts.create.emptyCombos}
            </p>
          )}
        </fieldset>

        <label className="block">
          <span className="text-sm font-medium text-zinc-800">
            {visitTexts.create.barberLabel}
          </span>
          <select
            value={barberId}
            onChange={(event) => setBarberId(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
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
          <span className="text-sm font-medium text-zinc-800">
            {visitTexts.create.skinnerLabel}
          </span>
          <select
            value={skinnerId}
            onChange={(event) => setSkinnerId(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
          >
            <option value="">{visitTexts.create.noStaffOption}</option>
            {skinners.map((skinner) => (
              <option key={skinner.id} value={skinner.id}>
                {skinner.username}
              </option>
            ))}
          </select>
        </label>

        <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-800">
          <span>{visitTexts.create.totalPriceLabel}</span>
          <span className="ml-2">{PRICE_FORMATTER.format(totalPrice)}</span>
        </p>

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isCreating}
          className="h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isCreating ? visitTexts.create.creating : visitTexts.create.submit}
        </button>
      </form>
    </section>
  );
}

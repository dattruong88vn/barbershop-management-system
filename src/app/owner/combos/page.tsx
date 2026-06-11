"use client";

import type { SyntheticEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/global/ui/button";
import { comboTexts } from "@/constants/texts";
import { useCombos } from "@/hooks/useCombos";
import { useServices } from "@/hooks/useServices";
import type { Combo } from "@/types";

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
});

const PRICE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

export default function OwnerCombosPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [error, setError] = useState("");
  const {
    combos,
    createCombo,
    deleteCombo,
    error: combosError,
    isCreating,
    isDeleting,
    isLoading,
    isUpdating,
    updateCombo,
  } = useCombos();
  const {
    services,
    error: servicesError,
    isLoading: isLoadingServices,
  } = useServices();

  const isSubmitting = isCreating || isUpdating;

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setSelectedServiceIds([]);
    setEditingCombo(null);
    setError("");
  }

  function handleEdit(combo: Combo) {
    setName(combo.name);
    setDescription(combo.description);
    setPrice(String(combo.price));
    setSelectedServiceIds(combo.services.map((service) => service.id));
    setEditingCombo(combo);
    setError("");
  }

  function handleToggleService(serviceId: string) {
    setSelectedServiceIds((currentServiceIds) =>
      currentServiceIds.includes(serviceId)
        ? currentServiceIds.filter((id) => id !== serviceId)
        : [...currentServiceIds, serviceId],
    );
  }

  function handleCopyCombo(comboId: string) {
    const combo = combos.find((currentCombo) => currentCombo.id === comboId);

    if (!combo) {
      return;
    }

    setSelectedServiceIds(combo.services.map((service) => service.id));
  }

  async function handleDelete(combo: Combo) {
    const isConfirmed = window.confirm(comboTexts.ownerCombos.deleteConfirm);

    if (!isConfirmed) {
      return;
    }

    setError("");

    try {
      await deleteCombo(combo.id);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : comboTexts.ownerCombos.errors.generic,
      );
    }
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const comboInput = {
      name: name.trim(),
      description: description.trim(),
      price: Number.parseFloat(price),
      serviceIds: selectedServiceIds,
    };

    if (!comboInput.name) {
      setError(comboTexts.ownerCombos.errors.missingName);
      return;
    }

    if (!comboInput.description) {
      setError(comboTexts.ownerCombos.errors.missingDescription);
      return;
    }

    if (!price.trim()) {
      setError(comboTexts.ownerCombos.errors.missingPrice);
      return;
    }

    if (!Number.isFinite(comboInput.price) || comboInput.price <= 0) {
      setError(comboTexts.ownerCombos.errors.invalidPrice);
      return;
    }

    if (comboInput.serviceIds.length === 0) {
      setError(comboTexts.ownerCombos.errors.missingServices);
      return;
    }

    try {
      if (editingCombo) {
        await updateCombo({
          id: editingCombo.id,
          ...comboInput,
        });
      } else {
        await createCombo(comboInput);
      }

      resetForm();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : comboTexts.ownerCombos.errors.generic,
      );
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[380px_1fr]">
        <section>
          <h1 className="text-2xl font-semibold">
            {comboTexts.ownerCombos.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {comboTexts.ownerCombos.description}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold">
              {editingCombo
                ? comboTexts.ownerCombos.editTitle
                : comboTexts.ownerCombos.createTitle}
            </h2>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-zinc-800">
                  {comboTexts.ownerCombos.nameLabel}
                </span>
                <input
                  type="text"
                  value={name}
                  required
                  placeholder={comboTexts.ownerCombos.namePlaceholder}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-800">
                  {comboTexts.ownerCombos.descriptionLabel}
                </span>
                <textarea
                  value={description}
                  required
                  placeholder={comboTexts.ownerCombos.descriptionPlaceholder}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-2 min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-800">
                  {comboTexts.ownerCombos.priceLabel}
                </span>
                <input
                  type="number"
                  value={price}
                  min={1}
                  step={1000}
                  required
                  placeholder={comboTexts.ownerCombos.pricePlaceholder}
                  onChange={(event) => setPrice(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-800">
                  {comboTexts.ownerCombos.copyFromComboLabel}
                </span>
                <select
                  value=""
                  onChange={(event) => handleCopyCombo(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
                >
                  <option value="">
                    {comboTexts.ownerCombos.copyPlaceholder}
                  </option>
                  {combos.map((combo) => (
                    <option key={combo.id} value={combo.id}>
                      {combo.name}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <p className="text-sm font-medium text-zinc-800">
                  {comboTexts.ownerCombos.servicesLabel}
                </p>
                {isLoadingServices ? (
                  <p className="mt-2 text-sm text-zinc-600">
                    {comboTexts.ownerCombos.loading}
                  </p>
                ) : null}
                {servicesError ? (
                  <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {servicesError instanceof Error
                      ? servicesError.message
                      : comboTexts.ownerCombos.errors.generic}
                  </p>
                ) : null}
                {!isLoadingServices && !servicesError && services.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-600">
                    {comboTexts.ownerCombos.emptyServices}
                  </p>
                ) : null}
                {services.length ? (
                  <div className="mt-2 space-y-2">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-3"
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedServiceIds.includes(service.id)}
                            onChange={() => handleToggleService(service.id)}
                            className="h-4 w-4 rounded border-zinc-300 text-zinc-950"
                          />
                          <span className="text-sm font-medium text-zinc-800">
                            {service.name}
                          </span>
                        </span>
                        <span className="text-sm text-zinc-600">
                          {PRICE_FORMATTER.format(service.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {error ? (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                variant="primary"
                className="h-11"
                disabled={isSubmitting}
              >
                {editingCombo
                  ? comboTexts.ownerCombos.submitUpdate
                  : comboTexts.ownerCombos.submitCreate}
              </Button>
              {editingCombo ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11"
                  onClick={resetForm}
                >
                  {comboTexts.ownerCombos.cancelEdit}
                </Button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          {isLoading ? (
            <p className="p-5 text-sm text-zinc-600">
              {comboTexts.ownerCombos.loading}
            </p>
          ) : null}

          {combosError ? (
            <p className="m-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {combosError instanceof Error
                ? combosError.message
                : comboTexts.ownerCombos.errors.generic}
            </p>
          ) : null}

          {!isLoading && !combosError && combos.length === 0 ? (
            <p className="p-5 text-sm text-zinc-600">
              {comboTexts.ownerCombos.empty}
            </p>
          ) : null}

          {combos.length ? (
            <div className="divide-y divide-zinc-200">
              {combos.map((combo) => (
                <article key={combo.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold">{combo.name}</h2>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        {combo.description}
                      </p>
                      <p className="mt-2 text-sm font-medium text-zinc-800">
                        {PRICE_FORMATTER.format(combo.price)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {combo.services.map((service) => (
                          <span
                            key={service.id}
                            className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700"
                          >
                            {service.name}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-zinc-500">
                        <span>{comboTexts.ownerCombos.createdAtLabel}</span>
                        <span className="ml-1">
                          {DATE_FORMATTER.format(new Date(combo.createdAt))}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9"
                        onClick={() => handleEdit(combo)}
                      >
                        {comboTexts.ownerCombos.edit}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="h-9"
                        disabled={isDeleting}
                        onClick={() => handleDelete(combo)}
                      >
                        {isDeleting
                          ? comboTexts.ownerCombos.deleting
                          : comboTexts.ownerCombos.delete}
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

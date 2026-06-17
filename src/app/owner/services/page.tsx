"use client";

import type { SyntheticEvent } from "react";
import { useState } from "react";

import { PageTitle } from "@/components/global";
import { Button } from "@/components/global/ui/button";
import {
  SERVICE_RESPONSIBLE_ROLE_BARBER,
  SERVICE_RESPONSIBLE_ROLE_SKINNER,
  type ServiceResponsibleRoleValue,
} from "@/constants/common";
import { serviceTexts } from "@/constants/texts";
import { useServices } from "@/hooks/useServices";
import type { Service } from "@/types";

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
});

const PRICE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

export default function OwnerServicesPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [responsibleRole, setResponsibleRole] =
    useState<ServiceResponsibleRoleValue>(SERVICE_RESPONSIBLE_ROLE_BARBER);
  const [isHaircut, setIsHaircut] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [error, setError] = useState("");
  const {
    services,
    createService,
    deleteService,
    error: servicesError,
    isCreating,
    isDeleting,
    isLoading,
    isUpdating,
    updateService,
  } = useServices();

  const isSubmitting = isCreating || isUpdating;

  function resetForm() {
    setName("");
    setPrice("");
    setResponsibleRole(SERVICE_RESPONSIBLE_ROLE_BARBER);
    setIsHaircut(false);
    setEditingService(null);
    setError("");
  }

  function handleEdit(service: Service) {
    setName(service.name);
    setPrice(String(service.price));
    setResponsibleRole(service.responsibleRole);
    setIsHaircut(service.isHaircut);
    setEditingService(service);
    setError("");
  }

  async function handleDelete(service: Service) {
    const isConfirmed = window.confirm(
      serviceTexts.ownerServices.deleteConfirm,
    );

    if (!isConfirmed) {
      return;
    }

    setError("");

    try {
      await deleteService(service.id);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : serviceTexts.ownerServices.errors.generic,
      );
    }
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const serviceInput = {
      name: name.trim(),
      price: Number.parseFloat(price),
      responsibleRole,
      isHaircut,
    };

    if (!serviceInput.name) {
      setError(serviceTexts.ownerServices.errors.missingName);
      return;
    }

    if (!price.trim()) {
      setError(serviceTexts.ownerServices.errors.missingPrice);
      return;
    }

    if (!Number.isFinite(serviceInput.price) || serviceInput.price <= 0) {
      setError(serviceTexts.ownerServices.errors.invalidPrice);
      return;
    }

    try {
      if (editingService) {
        await updateService({
          id: editingService.id,
          ...serviceInput,
        });
      } else {
        await createService(serviceInput);
      }

      resetForm();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : serviceTexts.ownerServices.errors.generic,
      );
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
        <section>
          <PageTitle>{serviceTexts.ownerServices.title}</PageTitle>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {serviceTexts.ownerServices.description}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold">
              {editingService
                ? serviceTexts.ownerServices.editTitle
                : serviceTexts.ownerServices.createTitle}
            </h2>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-zinc-800">
                  {serviceTexts.ownerServices.nameLabel}
                </span>
                <input
                  type="text"
                  value={name}
                  required
                  placeholder={serviceTexts.ownerServices.namePlaceholder}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-base text-zinc-950 outline-none transition focus:border-zinc-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-800">
                  {serviceTexts.ownerServices.priceLabel}
                </span>
                <input
                  type="number"
                  value={price}
                  min={1}
                  step={1000}
                  required
                  placeholder={serviceTexts.ownerServices.pricePlaceholder}
                  onChange={(event) => setPrice(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-base text-zinc-950 outline-none transition focus:border-zinc-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-800">
                  {serviceTexts.ownerServices.responsibleRoleLabel}
                </span>
                <select
                  value={responsibleRole}
                  onChange={(event) =>
                    setResponsibleRole(
                      event.target.value as ServiceResponsibleRoleValue,
                    )
                  }
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-base text-zinc-950 outline-none transition focus:border-zinc-950"
                >
                  <option value={SERVICE_RESPONSIBLE_ROLE_BARBER}>
                    {
                      serviceTexts.ownerServices.responsibleRoles[
                        SERVICE_RESPONSIBLE_ROLE_BARBER
                      ]
                    }
                  </option>
                  <option value={SERVICE_RESPONSIBLE_ROLE_SKINNER}>
                    {
                      serviceTexts.ownerServices.responsibleRoles[
                        SERVICE_RESPONSIBLE_ROLE_SKINNER
                      ]
                    }
                  </option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-md border border-zinc-200 px-3 py-3">
                <input
                  type="checkbox"
                  checked={isHaircut}
                  onChange={(event) => setIsHaircut(event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-950"
                />
                <span className="text-sm font-medium text-zinc-800">
                  {serviceTexts.ownerServices.isHaircutLabel}
                </span>
              </label>
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
                {editingService
                  ? serviceTexts.ownerServices.submitUpdate
                  : serviceTexts.ownerServices.submitCreate}
              </Button>
              {editingService ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11"
                  onClick={resetForm}
                >
                  {serviceTexts.ownerServices.cancelEdit}
                </Button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          {isLoading ? (
            <p className="p-5 text-sm text-zinc-600">
              {serviceTexts.ownerServices.loading}
            </p>
          ) : null}

          {servicesError ? (
            <p className="m-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {servicesError instanceof Error
                ? servicesError.message
                : serviceTexts.ownerServices.errors.generic}
            </p>
          ) : null}

          {!isLoading && !servicesError && services.length === 0 ? (
            <p className="p-5 text-sm text-zinc-600">
              {serviceTexts.ownerServices.empty}
            </p>
          ) : null}

          {services.length ? (
            <div className="divide-y divide-zinc-200">
              {services.map((service) => (
                <article key={service.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold">
                          {service.name}
                        </h2>
                        {service.isHaircut ? (
                          <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                            {serviceTexts.ownerServices.haircutBadge}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm font-medium text-zinc-800">
                        {PRICE_FORMATTER.format(service.price)}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        {
                          serviceTexts.ownerServices.responsibleRoles[
                            service.responsibleRole
                          ]
                        }
                      </p>
                      <p className="mt-3 text-xs text-zinc-500">
                        <span>{serviceTexts.ownerServices.createdAtLabel}</span>
                        <span className="ml-1">
                          {DATE_FORMATTER.format(new Date(service.createdAt))}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9"
                        onClick={() => handleEdit(service)}
                      >
                        {serviceTexts.ownerServices.edit}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="h-9"
                        disabled={isDeleting}
                        onClick={() => handleDelete(service)}
                      >
                        {isDeleting
                          ? serviceTexts.ownerServices.deleting
                          : serviceTexts.ownerServices.delete}
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

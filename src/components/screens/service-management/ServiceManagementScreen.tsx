"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import {
  Button,
  Card,
  PageTitle,
  SearchInput,
  Select,
  Tabs,
} from "@/components/global";
import {
  CATALOG_STATUS_ACTIVE,
  CATALOG_STATUS_DELETED,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  SERVICE_RESPONSIBLE_ROLE_BARBER,
  SERVICE_RESPONSIBLE_ROLES,
  SERVICE_SCOPE_BRANCH,
  SERVICE_SCOPE_SHOP,
  UI_FEEDBACK_TYPE_SUCCESS,
  type CatalogStatusValue,
  type ManagementRoleValue,
  type ServiceResponsibleRoleValue,
  type ServiceScopeValue,
} from "@/constants/common";
import { commonTexts, serviceTexts } from "@/constants/texts";
import { useServices } from "@/hooks/useServices";
import { dispatchAppToast } from "@/lib/toast";
import type { Service } from "@/types";
import { formatCurrencyInput, parseCurrencyInput } from "@/utils/common";
import { getStaffDisplayName } from "@/utils/staff";

import { ServiceDeleteModal } from "./ServiceDeleteModal";
import {
  ServiceFormModal,
  type ServiceResponsibleRoleFormValue,
} from "./ServiceFormModal";
import { ServiceTable } from "./ServiceTable";

const ALL_FILTER_VALUE = "all";
type ServiceScopeFilterValue = ServiceScopeValue | typeof ALL_FILTER_VALUE;
type ServiceResponsibleRoleFilterValue =
  | ServiceResponsibleRoleValue
  | typeof ALL_FILTER_VALUE;

type ServiceManagementScreenProps = {
  mode: ManagementRoleValue;
};

type ServiceFilters = {
  responsibleRole: ServiceResponsibleRoleFilterValue;
  scope: ServiceScopeFilterValue;
  search: string;
};

const DEFAULT_FILTERS: ServiceFilters = {
  responsibleRole: ALL_FILTER_VALUE,
  scope: ALL_FILTER_VALUE,
  search: "",
};

const CATALOG_STATUS_TABS = [
  {
    label: serviceTexts.ownerServices.statusTabs.active,
    value: CATALOG_STATUS_ACTIVE,
  },
  {
    label: serviceTexts.ownerServices.statusTabs.deleted,
    value: CATALOG_STATUS_DELETED,
  },
];

function getServiceSearchText(service: Service) {
  return [
    service.name,
    getStaffDisplayName(service.creator),
    service.branch?.name ?? serviceTexts.ownerServices.scopes.shop,
  ]
    .join(" ")
    .toLowerCase();
}

export function ServiceManagementScreen({ mode }: ServiceManagementScreenProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [responsibleRole, setResponsibleRole] =
    useState<ServiceResponsibleRoleFormValue>("");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draftFilters, setDraftFilters] =
    useState<ServiceFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<ServiceFilters>(DEFAULT_FILTERS);
  const [catalogStatus, setCatalogStatus] =
    useState<CatalogStatusValue>(CATALOG_STATUS_ACTIVE);
  const [page, setPage] = useState(DEFAULT_PAGE);
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
  } = useServices(catalogStatus);

  const filteredServices = useMemo(() => {
    const normalizedSearch = appliedFilters.search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch = normalizedSearch
        ? getServiceSearchText(service).includes(normalizedSearch)
        : true;
      const matchesScope =
        appliedFilters.scope === ALL_FILTER_VALUE ||
        service.scope === appliedFilters.scope;
      const matchesResponsibleRole =
        appliedFilters.responsibleRole === ALL_FILTER_VALUE ||
        service.responsibleRole === appliedFilters.responsibleRole;

      return matchesSearch && matchesScope && matchesResponsibleRole;
    });
  }, [appliedFilters, services]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredServices.length / DEFAULT_PAGE_SIZE),
  );
  const pageStartIndex = (page - 1) * DEFAULT_PAGE_SIZE;
  const visibleServices = filteredServices.slice(
    pageStartIndex,
    pageStartIndex + DEFAULT_PAGE_SIZE,
  );
  const pageStart = filteredServices.length ? pageStartIndex + 1 : 0;
  const pageEnd = Math.min(
    pageStartIndex + DEFAULT_PAGE_SIZE,
    filteredServices.length,
  );
  const isSubmitting = isCreating || isUpdating;

  function resetForm() {
    setName("");
    setPrice("");
    setResponsibleRole("");
    setEditingService(null);
    setError("");
  }

  function openCreateModal() {
    resetForm();
    setIsFormOpen(true);
  }

  function handleEdit(service: Service) {
    if (!service.canEdit) {
      return;
    }

    setName(service.name);
    setPrice(formatCurrencyInput(String(service.price)));
    setResponsibleRole(service.responsibleRole);
    setEditingService(service);
    setError("");
    setIsFormOpen(true);
  }

  function handleDeleteRequest(service: Service) {
    if (!service.canDelete) {
      return;
    }

    setDeletingService(service);
  }

  function closeFormModal(open: boolean) {
    setIsFormOpen(open);

    if (!open) {
      resetForm();
    }
  }

  function closeDeleteModal(open: boolean) {
    if (!open) {
      setDeletingService(null);
      setError("");
    }
  }

  function handleApplyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    setPage(DEFAULT_PAGE);
  }

  function handleCatalogStatusChange(value: string) {
    setCatalogStatus(value as CatalogStatusValue);
    setPage(DEFAULT_PAGE);
  }

  async function handleDelete() {
    if (!deletingService) {
      return;
    }

    setError("");

    try {
      await deleteService(deletingService.id);
      dispatchAppToast({
        message: serviceTexts.ownerServices.toast.deleted,
        type: UI_FEEDBACK_TYPE_SUCCESS,
      });
      setDeletingService(null);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : serviceTexts.ownerServices.errors.generic,
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const serviceInput = {
      name: name.trim(),
      price: parseCurrencyInput(price),
      responsibleRole,
      isHaircut: responsibleRole === SERVICE_RESPONSIBLE_ROLE_BARBER,
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

    if (!serviceInput.responsibleRole) {
      setError(serviceTexts.ownerServices.errors.missingResponsibleRole);
      return;
    }

    try {
      if (editingService) {
        await updateService({
          id: editingService.id,
          name: serviceInput.name,
          price: serviceInput.price,
          responsibleRole: serviceInput.responsibleRole,
          isHaircut: serviceInput.isHaircut,
        });
        dispatchAppToast({
          message: serviceTexts.ownerServices.toast.updated,
          type: UI_FEEDBACK_TYPE_SUCCESS,
        });
      } else {
        await createService({
          name: serviceInput.name,
          price: serviceInput.price,
          responsibleRole: serviceInput.responsibleRole,
          isHaircut: serviceInput.isHaircut,
        });
        dispatchAppToast({
          message: serviceTexts.ownerServices.toast.created,
          type: UI_FEEDBACK_TYPE_SUCCESS,
        });
      }

      closeFormModal(false);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : serviceTexts.ownerServices.errors.generic,
      );
    }
  }

  return (
    <div
      className="min-h-screen bg-gray-200 px-4 py-8 text-gray-1000 sm:px-6 lg:px-8"
      data-management-mode={mode}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header>
          <PageTitle>{serviceTexts.ownerServices.title}</PageTitle>
        </header>

        <Tabs
          tabs={CATALOG_STATUS_TABS}
          defaultValue={catalogStatus}
          onValueChange={handleCatalogStatusChange}
        />

        <Card padding="lg">
          <form
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_220px_220px_auto]"
            onSubmit={handleApplyFilters}
          >
            <label className="block">
              <span className="text-sm font-medium text-gray-1000">
                {serviceTexts.ownerServices.filterSearchLabel}
              </span>
              <SearchInput
                className="mt-2"
                clearLabel={commonTexts.feedback.clearSearch}
                placeholder={serviceTexts.ownerServices.namePlaceholder}
                value={draftFilters.search}
                onClear={() =>
                  setDraftFilters({
                    ...draftFilters,
                    search: "",
                  })
                }
                onChange={(event) =>
                  setDraftFilters({
                    ...draftFilters,
                    search: event.target.value,
                  })
                }
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-1000">
                {serviceTexts.ownerServices.table.scope}
              </span>
              <Select
                className="mt-2"
                value={draftFilters.scope}
                onChange={(event) =>
                  setDraftFilters({
                    ...draftFilters,
                    scope: event.target.value as ServiceScopeFilterValue,
                  })
                }
              >
                <option value={ALL_FILTER_VALUE}>
                  {serviceTexts.ownerServices.filterScopeAll}
                </option>
                <option value={SERVICE_SCOPE_SHOP}>
                  {serviceTexts.ownerServices.scopes.shop}
                </option>
                <option value={SERVICE_SCOPE_BRANCH}>
                  {serviceTexts.ownerServices.scopes.branch}
                </option>
              </Select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-1000">
                {serviceTexts.ownerServices.responsibleRoleLabel}
              </span>
              <Select
                className="mt-2"
                value={draftFilters.responsibleRole}
                onChange={(event) =>
                  setDraftFilters({
                    ...draftFilters,
                    responsibleRole: event.target
                      .value as ServiceResponsibleRoleFilterValue,
                  })
                }
              >
                <option value={ALL_FILTER_VALUE}>
                  {serviceTexts.ownerServices.filterResponsibleRoleAll}
                </option>
                {SERVICE_RESPONSIBLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {serviceTexts.ownerServices.responsibleRoles[role]}
                  </option>
                ))}
              </Select>
            </label>

            <div className="flex items-end justify-end">
              <Button type="submit">
                {serviceTexts.ownerServices.applyFilters}
              </Button>
            </div>
          </form>
        </Card>

        <ServiceTable
          catalogStatus={catalogStatus}
          currentPage={page}
          error={servicesError}
          isLoading={isLoading}
          pageEnd={pageEnd}
          pageStart={pageStart}
          pageStartIndex={pageStartIndex}
          services={visibleServices}
          totalCount={filteredServices.length}
          totalPages={totalPages}
          onCreate={openCreateModal}
          onDelete={handleDeleteRequest}
          onEdit={handleEdit}
          onPageChange={setPage}
        />
      </div>

      <ServiceFormModal
        editingService={editingService}
        error={error}
        isOpen={isFormOpen}
        isSubmitting={isSubmitting}
        name={name}
        price={price}
        responsibleRole={responsibleRole}
        onNameChange={setName}
        onOpenChange={closeFormModal}
        onPriceChange={(value) => setPrice(formatCurrencyInput(value))}
        onResponsibleRoleChange={setResponsibleRole}
        onSubmit={handleSubmit}
      />

      <ServiceDeleteModal
        error={error}
        isDeleting={isDeleting}
        service={deletingService}
        onConfirm={handleDelete}
        onOpenChange={closeDeleteModal}
      />
    </div>
  );
}

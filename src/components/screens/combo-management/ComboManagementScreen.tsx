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
  SERVICE_SCOPE_BRANCH,
  SERVICE_SCOPE_SHOP,
  UI_FEEDBACK_TYPE_SUCCESS,
  type CatalogStatusValue,
  type ManagementRoleValue,
  type ServiceScopeValue,
  USER_ROLE_OWNER,
} from "@/constants/common";
import { commonTexts, comboTexts } from "@/constants/texts";
import { useCombos } from "@/hooks/useCombos";
import { useServices } from "@/hooks/useServices";
import { dispatchAppToast } from "@/lib/toast";
import type { Combo } from "@/types";
import { formatCurrencyInput, parseCurrencyInput } from "@/utils/common";

import { ComboDeleteModal } from "./ComboDeleteModal";
import { ComboFormModal } from "./ComboFormModal";
import { ComboTable } from "./ComboTable";

const ALL_FILTER_VALUE = "all";
type ComboScopeFilterValue = ServiceScopeValue | typeof ALL_FILTER_VALUE;

type ComboManagementScreenProps = {
  mode: ManagementRoleValue;
};

type ComboFilters = {
  scope: ComboScopeFilterValue;
  search: string;
};

const DEFAULT_FILTERS: ComboFilters = {
  scope: ALL_FILTER_VALUE,
  search: "",
};

const CATALOG_STATUS_TABS = [
  {
    label: comboTexts.ownerCombos.statusTabs.active,
    value: CATALOG_STATUS_ACTIVE,
  },
  {
    label: comboTexts.ownerCombos.statusTabs.deleted,
    value: CATALOG_STATUS_DELETED,
  },
];

function getComboScope(combo: Combo): ServiceScopeValue {
  return combo.scope ?? (combo.branchId ? SERVICE_SCOPE_BRANCH : SERVICE_SCOPE_SHOP);
}

function getComboSearchText(combo: Combo) {
  return [
    combo.name,
    combo.description,
    combo.creator?.username ?? "",
    combo.branch?.name ?? comboTexts.ownerCombos.scopes.shop,
    ...combo.services.map((service) => service.name),
  ]
    .join(" ")
    .toLowerCase();
}

export function ComboManagementScreen({ mode }: ComboManagementScreenProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [duplicatingCombo, setDuplicatingCombo] = useState<Combo | null>(null);
  const [hasDuplicateUnavailableServices, setHasDuplicateUnavailableServices] =
    useState(false);
  const [hasDuplicateNoAvailableServices, setHasDuplicateNoAvailableServices] =
    useState(false);
  const [deletingCombo, setDeletingCombo] = useState<Combo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draftFilters, setDraftFilters] =
    useState<ComboFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<ComboFilters>(DEFAULT_FILTERS);
  const [catalogStatus, setCatalogStatus] =
    useState<CatalogStatusValue>(CATALOG_STATUS_ACTIVE);
  const [page, setPage] = useState(DEFAULT_PAGE);
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
  } = useCombos(catalogStatus);
  const {
    services,
    error: servicesError,
    isLoading: isLoadingServices,
  } = useServices(CATALOG_STATUS_ACTIVE);

  const filteredCombos = useMemo(() => {
    const normalizedSearch = appliedFilters.search.trim().toLowerCase();

    return combos.filter((combo) => {
      const matchesSearch = normalizedSearch
        ? getComboSearchText(combo).includes(normalizedSearch)
        : true;
      const matchesScope =
        appliedFilters.scope === ALL_FILTER_VALUE ||
        getComboScope(combo) === appliedFilters.scope;

      return matchesSearch && matchesScope;
    });
  }, [appliedFilters, combos]);

  const availableServices = useMemo(
    () =>
      services.filter((service) => {
        const serviceScope =
          service.scope ??
          (service.branchId ? SERVICE_SCOPE_BRANCH : SERVICE_SCOPE_SHOP);

        return mode === USER_ROLE_OWNER
          ? serviceScope === SERVICE_SCOPE_SHOP
          : serviceScope === SERVICE_SCOPE_BRANCH;
      }),
    [mode, services],
  );
  const selectedServicesTotal = useMemo(
    () =>
      availableServices
        .filter((service) => selectedServiceIds.includes(service.id))
        .reduce((total, service) => total + service.price, 0),
    [availableServices, selectedServiceIds],
  );
  const parsedComboPrice = parseCurrencyInput(price);
  const priceWarning =
    selectedServiceIds.length > 0 &&
    Number.isFinite(parsedComboPrice) &&
    parsedComboPrice > selectedServicesTotal;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCombos.length / DEFAULT_PAGE_SIZE),
  );
  const pageStartIndex = (page - 1) * DEFAULT_PAGE_SIZE;
  const visibleCombos = filteredCombos.slice(
    pageStartIndex,
    pageStartIndex + DEFAULT_PAGE_SIZE,
  );
  const pageStart = filteredCombos.length ? pageStartIndex + 1 : 0;
  const pageEnd = Math.min(
    pageStartIndex + DEFAULT_PAGE_SIZE,
    filteredCombos.length,
  );
  const isSubmitting = isCreating || isUpdating;

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setSelectedServiceIds([]);
    setEditingCombo(null);
    setDuplicatingCombo(null);
    setHasDuplicateUnavailableServices(false);
    setHasDuplicateNoAvailableServices(false);
    setError("");
  }

  function openCreateModal() {
    resetForm();
    setIsFormOpen(true);
  }

  function handleEdit(combo: Combo) {
    if (combo.canEdit === false || combo.isUsedInVisit) {
      return;
    }

    const availableServiceIds = new Set(
      availableServices.map((service) => service.id),
    );

    setName(combo.name);
    setDescription(combo.description);
    setPrice(formatCurrencyInput(String(combo.price)));
    setSelectedServiceIds(
      combo.services
        .map((service) => service.id)
        .filter((serviceId) => availableServiceIds.has(serviceId)),
    );
    setEditingCombo(combo);
    setDuplicatingCombo(null);
    setHasDuplicateUnavailableServices(false);
    setHasDuplicateNoAvailableServices(false);
    setError("");
    setIsFormOpen(true);
  }

  function handleDuplicate(combo: Combo) {
    const availableServiceIds = new Set(
      availableServices.map((service) => service.id),
    );

    setName(`${combo.name}${comboTexts.ownerCombos.copySuffix}`);
    setDescription(combo.description);
    setPrice(formatCurrencyInput(String(combo.price)));
    const comboServiceIds = combo.services.map((service) => service.id);
    const duplicateServiceIds = comboServiceIds.filter((serviceId) =>
      availableServiceIds.has(serviceId),
    );

    setSelectedServiceIds(duplicateServiceIds);
    setEditingCombo(null);
    setDuplicatingCombo(combo);
    setHasDuplicateUnavailableServices(
      duplicateServiceIds.length > 0 &&
        duplicateServiceIds.length !== comboServiceIds.length,
    );
    setHasDuplicateNoAvailableServices(duplicateServiceIds.length === 0);
    setError("");
    setIsFormOpen(true);
  }

  function handleDeleteRequest(combo: Combo) {
    if (combo.canDelete === false) {
      return;
    }

    setDeletingCombo(combo);
  }

  function handleToggleService(serviceId: string) {
    setSelectedServiceIds((currentServiceIds) =>
      currentServiceIds.includes(serviceId)
        ? currentServiceIds.filter((id) => id !== serviceId)
        : [...currentServiceIds, serviceId],
    );
  }

  function closeFormModal(open: boolean) {
    setIsFormOpen(open);

    if (!open) {
      resetForm();
    }
  }

  function closeDeleteModal(open: boolean) {
    if (!open) {
      setDeletingCombo(null);
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
    if (!deletingCombo) {
      return;
    }

    setError("");

    try {
      await deleteCombo(deletingCombo.id);
      dispatchAppToast({
        message: comboTexts.ownerCombos.toast.deleted,
        type: UI_FEEDBACK_TYPE_SUCCESS,
      });
      setDeletingCombo(null);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : comboTexts.ownerCombos.errors.generic,
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const comboInput = {
      name: name.trim(),
      description: description.trim(),
      price: parseCurrencyInput(price),
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
        dispatchAppToast({
          message: comboTexts.ownerCombos.toast.updated,
          type: UI_FEEDBACK_TYPE_SUCCESS,
        });
      } else {
        await createCombo(comboInput);
        dispatchAppToast({
          message: comboTexts.ownerCombos.toast.created,
          type: UI_FEEDBACK_TYPE_SUCCESS,
        });
      }

      closeFormModal(false);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : comboTexts.ownerCombos.errors.generic,
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
          <PageTitle>{comboTexts.ownerCombos.title}</PageTitle>
        </header>

        <Tabs
          tabs={CATALOG_STATUS_TABS}
          defaultValue={catalogStatus}
          onValueChange={handleCatalogStatusChange}
        />

        <Card padding="lg">
          <form
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_220px_auto]"
            onSubmit={handleApplyFilters}
          >
            <label className="block">
              <span className="text-sm font-medium text-gray-1000">
                {comboTexts.ownerCombos.filterSearchLabel}
              </span>
              <SearchInput
                className="mt-2"
                clearLabel={commonTexts.feedback.clearSearch}
                placeholder={comboTexts.ownerCombos.namePlaceholder}
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
                {comboTexts.ownerCombos.table.scope}
              </span>
              <Select
                className="mt-2"
                value={draftFilters.scope}
                onChange={(event) =>
                  setDraftFilters({
                    ...draftFilters,
                    scope: event.target.value as ComboScopeFilterValue,
                  })
                }
              >
                <option value={ALL_FILTER_VALUE}>
                  {comboTexts.ownerCombos.filterScopeAll}
                </option>
                <option value={SERVICE_SCOPE_SHOP}>
                  {comboTexts.ownerCombos.scopes.shop}
                </option>
                <option value={SERVICE_SCOPE_BRANCH}>
                  {comboTexts.ownerCombos.scopes.branch}
                </option>
              </Select>
            </label>

            <div className="flex items-end justify-end">
              <Button type="submit">
                {comboTexts.ownerCombos.applyFilters}
              </Button>
            </div>
          </form>
        </Card>

        <ComboTable
          catalogStatus={catalogStatus}
          combos={visibleCombos}
          currentPage={page}
          error={combosError}
          isLoading={isLoading}
          pageEnd={pageEnd}
          pageStart={pageStart}
          pageStartIndex={pageStartIndex}
          totalCount={filteredCombos.length}
          totalPages={totalPages}
          onCreate={openCreateModal}
          onDelete={handleDeleteRequest}
          onDuplicate={handleDuplicate}
          onEdit={handleEdit}
          onPageChange={setPage}
        />
      </div>

      <ComboFormModal
        description={description}
        hasDuplicateNoAvailableServices={hasDuplicateNoAvailableServices}
        hasDuplicateUnavailableServices={hasDuplicateUnavailableServices}
        isDuplicating={duplicatingCombo !== null}
        editingCombo={editingCombo}
        error={error}
        isLoadingServices={isLoadingServices}
        isOpen={isFormOpen}
        isSubmitting={isSubmitting}
        name={name}
        price={price}
        priceWarning={priceWarning}
        selectedServiceIds={selectedServiceIds}
        selectedServicesTotal={selectedServicesTotal}
        services={availableServices}
        servicesError={servicesError}
        onDescriptionChange={setDescription}
        onNameChange={setName}
        onOpenChange={closeFormModal}
        onPriceChange={(value) => setPrice(formatCurrencyInput(value))}
        onServiceToggle={handleToggleService}
        onSubmit={handleSubmit}
      />

      <ComboDeleteModal
        combo={deletingCombo}
        error={error}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onOpenChange={closeDeleteModal}
      />
    </div>
  );
}

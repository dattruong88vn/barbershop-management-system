"use client";

import type { SyntheticEvent } from "react";
import {
  useMemo,
  useState,
} from "react";

import { InlineAlert } from "@/components/global/InlineAlert";
import { Button } from "@/components/global/ui/button";
import {
  UI_VARIANT_GHOST,
  UI_VARIANT_PRIMARY,
  VISIT_ITEM_TYPE_COMBO,
  VISIT_ITEM_TYPE_SERVICE,
  VISIT_STATUS_COMPLETED,
} from "@/constants/common";
import { visitTexts } from "@/constants/texts";
import { dispatchAppToast } from "@/lib/toast";
import type {
  CustomerVisit,
  VisitCreateItem,
  VisitCreateStaff,
  VisitDetailUpdateInput,
  VisitStaffUpdateInput,
} from "@/types";
import { toggleId } from "@/utils/common/collection";
import { formatVndPrice } from "@/utils/common/formatters";
import {
  VisitCreateItemSelector,
  VisitCreateStaffSelect,
} from "@/components/modules/customers/VisitCreateFormFields";
import {
  calculateVisitTotalPrice,
  getVisitItemIds,
  mergeVisitItems,
} from "@/utils/visits/visitDetail";

export function VisitDetailEditForm({
  barbers,
  combos,
  isUpdatingDetail,
  isUpdatingStaff,
  onCancel,
  onUpdateDetail,
  onUpdateStaff,
  services,
  skinners,
  visit,
}: {
  barbers: VisitCreateStaff[];
  combos: VisitCreateItem[];
  isUpdatingDetail: boolean;
  isUpdatingStaff: boolean;
  onCancel: () => void;
  onUpdateDetail: (input: VisitDetailUpdateInput) => Promise<CustomerVisit>;
  onUpdateStaff: (input: VisitStaffUpdateInput) => Promise<CustomerVisit>;
  services: VisitCreateItem[];
  skinners: VisitCreateStaff[];
  visit: CustomerVisit;
}) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() =>
    getVisitItemIds(visit, VISIT_ITEM_TYPE_SERVICE),
  );
  const [selectedComboIds, setSelectedComboIds] = useState<string[]>(() =>
    getVisitItemIds(visit, VISIT_ITEM_TYPE_COMBO),
  );
  const [barberId, setBarberId] = useState(visit.barber?.id ?? "");
  const [noHaircut, setNoHaircut] = useState(Boolean(visit.noHaircut));
  const [skinnerId, setSkinnerId] = useState(visit.skinner?.id ?? "");
  const [noSkinnerService, setNoSkinnerService] = useState(
    Boolean(visit.noSkinnerService),
  );
  const [error, setError] = useState("");
  const isCompletedVisit = visit.status === VISIT_STATUS_COMPLETED;
  const isSubmitting = isCompletedVisit ? isUpdatingStaff : isUpdatingDetail;
  const serviceOptions = useMemo(
    () => mergeVisitItems(services, visit, VISIT_ITEM_TYPE_SERVICE),
    [services, visit],
  );
  const comboOptions = useMemo(
    () => mergeVisitItems(combos, visit, VISIT_ITEM_TYPE_COMBO),
    [combos, visit],
  );
  const totalPrice = useMemo(
    () =>
      calculateVisitTotalPrice(
        selectedServiceIds,
        selectedComboIds,
        serviceOptions,
        comboOptions,
      ),
    [comboOptions, selectedComboIds, selectedServiceIds, serviceOptions],
  );

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isCompletedVisit && !selectedServiceIds.length && !selectedComboIds.length) {
      setError(visitTexts.create.errors.missingItems);
      return;
    }

    if (!isCompletedVisit && selectedServiceIds.length && selectedComboIds.length) {
      setError(visitTexts.create.errors.mixedItems);
      return;
    }

    try {
      if (isCompletedVisit) {
        await onUpdateStaff({
          barberId: noHaircut ? null : barberId || null,
          customerId: "",
          noHaircut,
          noSkinnerService,
          skinnerId: noSkinnerService ? null : skinnerId || null,
          visitId: visit.id,
        });
      } else {
        await onUpdateDetail({
          barberId: noHaircut ? null : barberId || null,
          comboIds: selectedComboIds,
          noHaircut,
          noSkinnerService,
          serviceIds: selectedServiceIds,
          skinnerId: noSkinnerService ? null : skinnerId || null,
          visitId: visit.id,
        });
      }
      dispatchAppToast({
        description: visitTexts.detail.editSuccessDescription,
        message: visitTexts.detail.editSuccess,
        type: "success",
      });
      onCancel();
    } catch (detailUpdateError) {
      setError(
        detailUpdateError instanceof Error
          ? detailUpdateError.message
          : visitTexts.detail.errors.generic,
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-5">
      <VisitCreateItemSelector
        disabled={isCompletedVisit}
        emptyText={visitTexts.create.emptyServices}
        items={serviceOptions}
        label={visitTexts.create.servicesLabel}
        selectedIds={selectedServiceIds}
        onToggleItem={(serviceId) => {
          setSelectedComboIds([]);
          setSelectedServiceIds((currentIds) => toggleId(currentIds, serviceId));
        }}
      />

      <VisitCreateItemSelector
        disabled={isCompletedVisit}
        emptyText={visitTexts.create.emptyCombos}
        items={comboOptions}
        label={visitTexts.create.combosLabel}
        selectedIds={selectedComboIds}
        onToggleItem={(comboId) => {
          setSelectedServiceIds([]);
          setSelectedComboIds((currentIds) => toggleId(currentIds, comboId));
        }}
      />

      <VisitCreateStaffSelect
        isSkipped={noHaircut}
        label={visitTexts.create.barberLabel}
        skipOptionLabel={visitTexts.create.noHaircutOption}
        placeholder={visitTexts.create.barberPlaceholder}
        staff={barbers}
        value={barberId}
        onSkippedChange={(checked) => {
          setNoHaircut(checked);

          if (checked) {
            setBarberId("");
          }
        }}
        onValueChange={setBarberId}
      />

      <VisitCreateStaffSelect
        isSkipped={noSkinnerService}
        label={visitTexts.create.skinnerLabel}
        skipOptionLabel={visitTexts.create.noSkinnerServiceOption}
        placeholder={visitTexts.create.skinnerPlaceholder}
        staff={skinners}
        value={skinnerId}
        onSkippedChange={(checked) => {
          setNoSkinnerService(checked);

          if (checked) {
            setSkinnerId("");
          }
        }}
        onValueChange={setSkinnerId}
      />

      <p className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground">
        <span>{visitTexts.create.totalPriceLabel}</span>
        <span className="text-right text-base font-semibold">
          {formatVndPrice(totalPrice)}
        </span>
      </p>

      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <div className="flex justify-end gap-3">
        <Button type="button" variant={UI_VARIANT_GHOST} onClick={onCancel}>
          {visitTexts.detail.closeEditVisit}
        </Button>
        <Button type="submit" variant={UI_VARIANT_PRIMARY} loading={isSubmitting}>
          {visitTexts.detail.saveEditVisit}
        </Button>
      </div>
    </form>
  );
}

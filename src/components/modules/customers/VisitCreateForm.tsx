"use client";

import type { SyntheticEvent } from "react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { InlineAlert } from "@/components/global/InlineAlert";
import { Button } from "@/components/global/ui/button";
import {
  UI_VARIANT_PRIMARY,
  USER_ROLE_BARBER,
  USER_ROLE_SKINNER,
  VISIT_ITEM_TYPE_COMBO,
  VISIT_ITEM_TYPE_SERVICE,
} from "@/constants/common";
import { ROUTES } from "@/constants/routes";
import { customerTexts, visitTexts } from "@/constants/texts";
import { useVisitContext } from "@/context/VisitContext";
import { dispatchAppToast } from "@/lib/toast";
import type { AuthUserFields, VisitCreateFormProps } from "@/types";
import { toggleId } from "@/utils/common/collection";
import { formatVndPrice } from "@/utils/common/formatters";
import {
  calculateVisitTotalPrice,
  getSuggestedVisitItemIds,
} from "@/utils/visits/visitDetail";
import {
  VisitCreateItemSelector,
  VisitCreateStaffSelect,
} from "./VisitCreateFormFields";

export default function VisitCreateForm({
  customerId,
  returnToCustomerId,
  suggestions,
}: VisitCreateFormProps) {
  const router = useRouter();
  const suggestedComboIds = getSuggestedVisitItemIds(
    suggestions,
    VISIT_ITEM_TYPE_COMBO,
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() =>
    suggestedComboIds.length
      ? []
      : getSuggestedVisitItemIds(suggestions, VISIT_ITEM_TYPE_SERVICE),
  );
  const [selectedComboIds, setSelectedComboIds] = useState<string[]>(
    suggestedComboIds,
  );
  const [barberId, setBarberId] = useState(suggestions?.barber?.id ?? "");
  const [skinnerId, setSkinnerId] = useState(suggestions?.skinner?.id ?? "");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<AuthUserFields | null>(null);
  const [hasSkippedCurrentBarberDefault, setHasSkippedCurrentBarberDefault] =
    useState(false);
  const [hasSkippedCurrentSkinnerDefault, setHasSkippedCurrentSkinnerDefault] =
    useState(false);
  const {
    barbers,
    combos,
    createVisit,
    isCreating,
    isLoadingOptions,
    optionsError,
    services,
    skinners,
  } = useVisitContext();

  const totalPrice = useMemo(
    () =>
      calculateVisitTotalPrice(
        selectedServiceIds,
        selectedComboIds,
        services,
        combos,
      ),
    [combos, selectedComboIds, selectedServiceIds, services],
  );
  const currentUserBarberId = useMemo(
    () =>
      currentUser?.role === USER_ROLE_BARBER &&
      !hasSkippedCurrentBarberDefault &&
      barbers.some((barber) => barber.id === currentUser.id)
        ? currentUser.id
        : "",
    [barbers, currentUser, hasSkippedCurrentBarberDefault],
  );
  const currentUserSkinnerId = useMemo(
    () =>
      currentUser?.role === USER_ROLE_SKINNER &&
      !hasSkippedCurrentSkinnerDefault &&
      skinners.some((skinner) => skinner.id === currentUser.id)
        ? currentUser.id
        : "",
    [currentUser, hasSkippedCurrentSkinnerDefault, skinners],
  );
  const selectedBarberId = barberId || currentUserBarberId;
  const selectedSkinnerId = skinnerId || currentUserSkinnerId;

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const session = await getSession();

      if (isMounted) {
        setCurrentUser(session?.user ?? null);
      }
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

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
        barberId: selectedBarberId || null,
        skinnerId: selectedSkinnerId || null,
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
      const errorMessage =
        mutationError instanceof Error
          ? mutationError.message
          : visitTexts.create.errors.generic;

      setError(errorMessage);

      if (errorMessage === visitTexts.api.errors.openVisitExists) {
        dispatchAppToast({
          description: customerTexts.detail.createVisitBlockedDescription,
          message: customerTexts.detail.createVisitBlocked,
          type: "warning",
        });
      }
    }
  }

  return (
    <section
      id="create-visit"
      className="scroll-mt-6"
    >
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-base font-semibold text-foreground">
            {visitTexts.create.serviceSectionTitle}
          </h2>
          <div className="mt-4 space-y-5">
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
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-base font-semibold text-foreground">
            {visitTexts.create.staffSectionTitle}
          </h2>
          <div className="mt-4 space-y-5">
            <VisitCreateStaffSelect
              label={visitTexts.create.barberLabel}
              placeholder={visitTexts.create.barberPlaceholder}
              staff={barbers}
              value={selectedBarberId}
              onValueChange={(value) => {
                setHasSkippedCurrentBarberDefault(!value);
                setBarberId(value);
              }}
            />

            <VisitCreateStaffSelect
              label={visitTexts.create.skinnerLabel}
              placeholder={visitTexts.create.skinnerPlaceholder}
              staff={skinners}
              value={selectedSkinnerId}
              onValueChange={(value) => {
                setHasSkippedCurrentSkinnerDefault(!value);
                setSkinnerId(value);
              }}
            />
          </div>
        </section>

        <p className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground">
          <span>{visitTexts.create.totalPriceLabel}</span>
          <span className="text-right text-base font-semibold">
            {formatVndPrice(totalPrice)}
          </span>
        </p>

        {error ? <InlineAlert>{error}</InlineAlert> : null}

        <Button
          type="submit"
          disabled={isCreating}
          variant={UI_VARIANT_PRIMARY}
          className="h-11 w-full rounded-lg disabled:cursor-not-allowed"
        >
          {isCreating ? visitTexts.create.creating : visitTexts.create.submit}
        </Button>
      </form>
    </section>
  );
}

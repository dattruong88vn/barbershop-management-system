"use client";

import type { SyntheticEvent } from "react";
import { use, useMemo, useState } from "react";

import {
  CustomerProfileHeader,
  EditCustomerModal,
  PhotoLightbox,
  PhotosSection,
  ProfileSummarySection,
  SuggestionsSection,
  VisitHistorySection,
} from "@/components/modules/customers";
import { AppMobileBottomNav } from "@/components/mobile/AppMobileBottomNav";
import { InlineAlert } from "@/components/global/InlineAlert";
import { customerTexts } from "@/constants/texts";
import {
  VISIT_STATUS_COMPLETED,
  VISIT_STATUS_IN_PROGRESS,
  VISIT_STATUS_PENDING,
} from "@/constants/visitStatuses";
import { useCustomerVisits } from "@/hooks/useCustomerVisits";
import {
  formatCompactMoney,
  getRecentVisitPhotos,
  getVisitCycleDays,
  hasVisitPhotoWarning,
} from "@/lib/customerVisitDisplay";
import { dispatchAppToast } from "@/lib/toast";
import type { CustomerProfileMetric, CustomerVisitPhoto } from "@/types";

const PHONE_REGEX = /^0\d{9}$/;
const VISIT_HISTORY_LIMIT = 10;

type CustomerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id: customerId } = use(params);
  const {
    customer,
    error,
    isLoading,
    isUpdatingCustomer,
    suggestions,
    updateCustomer,
    visits,
  } = useCustomerVisits(customerId);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerVisitPhoto | null>(
    null,
  );
  const [visibleVisitCount, setVisibleVisitCount] = useState(VISIT_HISTORY_LIMIT);

  const completedVisits = useMemo(
    () => visits.filter((visit) => visit.status === VISIT_STATUS_COMPLETED),
    [visits],
  );
  const hasOpenVisit = visits.some(
    (visit) =>
      visit.status === VISIT_STATUS_PENDING ||
      visit.status === VISIT_STATUS_IN_PROGRESS,
  );
  const latestVisit = completedVisits[0] ?? null;
  const recentPhotos = useMemo(
    () => getRecentVisitPhotos(completedVisits),
    [completedVisits],
  );
  const visibleVisits = visits.slice(0, visibleVisitCount);
  const totalSpend = completedVisits.reduce(
    (total, visit) => total + visit.totalPrice,
    0,
  );
  const visitCycleDays = getVisitCycleDays(completedVisits);
  const shouldWarnPhoto = hasVisitPhotoWarning(latestVisit);
  const isProfileLoading = isLoading && !customer;
  const displayName = customer?.name ?? customerTexts.detail.profileTitle;
  const displayPhone = customer?.phone ?? customerTexts.detail.noStaff;
  const metrics: CustomerProfileMetric[] = [
    {
      desktopLabel: customerTexts.detail.visitCountMetric,
      mobileLabel: customerTexts.detail.visitCountMetricMobile,
      value: completedVisits.length.toString(),
    },
    {
      desktopLabel: customerTexts.detail.totalSpendMetric,
      mobileLabel: customerTexts.detail.totalSpendMetricMobile,
      value: formatCompactMoney(totalSpend),
    },
    {
      desktopLabel: customerTexts.detail.visitCycleMetric,
      mobileLabel: customerTexts.detail.visitCycleMetricMobile,
      value:
        visitCycleDays === null
          ? "-"
          : customerTexts.detail.visitCycleValue(visitCycleDays),
      mobileValue:
        visitCycleDays === null
          ? "-"
          : customerTexts.detail.visitCycleValueCompact(visitCycleDays),
    },
  ];

  function openEditModal() {
    setName(customer?.name ?? "");
    setPhone(customer?.phone ?? "");
    setFormError("");
    setIsMenuOpen(false);
    setIsEditOpen(true);
  }

  async function handleUpdateCustomer(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const customerInput = {
      name: name.trim(),
      phone: phone.trim(),
    };

    if (!customerInput.name) {
      setFormError(customerTexts.detail.errors.missingName);
      return;
    }

    if (!customerInput.phone) {
      setFormError(customerTexts.detail.errors.missingPhone);
      return;
    }

    if (!PHONE_REGEX.test(customerInput.phone)) {
      setFormError(customerTexts.detail.errors.invalidPhone);
      return;
    }

    try {
      const updatedCustomer = await updateCustomer({
        id: customerId,
        name: customerInput.name,
        phone: customerInput.phone,
      });

      setIsEditOpen(false);
      dispatchAppToast({
        description: customerTexts.detail.updateSuccessDescription(
          updatedCustomer.name,
        ),
        message: customerTexts.detail.updateSuccess,
        type: "success",
      });
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : customerTexts.detail.errors.generic,
      );
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 px-0 py-0 text-foreground md:px-6 md:py-8">
      <div className="mx-auto w-full md:max-w-5xl">
        <div className="overflow-hidden bg-muted/30 md:rounded-xl md:border md:border-border md:bg-background">
          <CustomerProfileHeader
            customerId={customerId}
            customerName={customer?.name ?? null}
            customerPhone={customer?.phone ?? null}
            hasOpenVisit={hasOpenVisit}
            isMenuOpen={isMenuOpen}
            onEdit={openEditModal}
            onToggleMenu={() => setIsMenuOpen((current) => !current)}
          />

          <div className="px-4 pb-16 pt-4 md:px-5 md:pb-7 md:pt-5">
            {error ? (
              <InlineAlert className="mb-4">
                {error instanceof Error
                  ? error.message
                  : customerTexts.detail.errors.generic}
              </InlineAlert>
            ) : null}

            <ProfileSummarySection
              completedVisitCount={completedVisits.length}
              displayName={displayName}
              displayPhone={displayPhone}
              isLoading={isProfileLoading}
              latestVisit={latestVisit}
              metrics={metrics}
              shouldWarnPhoto={shouldWarnPhoto}
            />

            <SuggestionsSection
              isLoading={isProfileLoading}
              suggestions={suggestions}
            />

            <PhotosSection
              isLoading={isProfileLoading}
              onSelectPhoto={setSelectedPhoto}
              recentPhotos={recentPhotos}
            />

            <VisitHistorySection
              customerId={customerId}
              error={error}
              isLoading={isProfileLoading}
              onShowMore={() =>
                setVisibleVisitCount((current) => current + VISIT_HISTORY_LIMIT)
              }
              visitCount={visits.length}
              visibleVisitCount={visibleVisitCount}
              visibleVisits={visibleVisits}
            />
          </div>

          <AppMobileBottomNav activeItem="search" />
        </div>
      </div>

      <EditCustomerModal
        error={formError}
        isOpen={isEditOpen}
        isUpdating={isUpdatingCustomer}
        name={name}
        phone={phone}
        onClose={() => setIsEditOpen(false)}
        onNameChange={setName}
        onPhoneChange={setPhone}
        onSubmit={handleUpdateCustomer}
      />

      <PhotoLightbox
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </main>
  );
}

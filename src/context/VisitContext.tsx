"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { useVisitDetail } from "@/hooks/useVisitDetail";
import { useVisits } from "@/hooks/useVisits";
import type {
  VisitContextValue,
  VisitDetailUpdateInput,
  VisitProviderProps,
  VisitStaffUpdateInput,
  VisitStatusUpdateInput,
} from "@/types";

const VisitContext = createContext<VisitContextValue | null>(null);

export function VisitProvider({
  backHref,
  children,
  returnToCustomerId = null,
  visitId = "",
}: VisitProviderProps) {
  const visitOptions = useVisits();
  const visitDetail = useVisitDetail(visitId);
  const normalizedReturnToCustomerId = returnToCustomerId ?? null;

  const updateVisitDetail = useCallback(
    (input: VisitDetailUpdateInput) =>
      visitDetail.updateVisitDetail({
        ...input,
        customerId: input.customerId ?? normalizedReturnToCustomerId,
      }),
    [normalizedReturnToCustomerId, visitDetail],
  );

  const updateVisitStaff = useCallback(
    (input: VisitStaffUpdateInput) =>
      visitDetail.updateVisitStaff({
        ...input,
        customerId: input.customerId || normalizedReturnToCustomerId || "",
      }),
    [normalizedReturnToCustomerId, visitDetail],
  );

  const updateVisitStatus = useCallback(
    (input: VisitStatusUpdateInput) =>
      visitDetail.updateVisitStatus({
        ...input,
        customerId: input.customerId ?? normalizedReturnToCustomerId,
      }),
    [normalizedReturnToCustomerId, visitDetail],
  );

  const value = useMemo<VisitContextValue>(
    () => ({
      backHref,
      barbers: visitOptions.barbers,
      combos: visitOptions.combos,
      createVisit: visitOptions.createVisit,
      deleteVisitPhoto: visitDetail.deleteVisitPhoto,
      error: visitDetail.error,
      isCreating: visitOptions.isCreating,
      isDeletingPhoto: visitDetail.isDeletingPhoto,
      isLoading: visitDetail.isLoading,
      isLoadingOptions: visitOptions.isLoadingOptions,
      isRefreshingDetail: visitDetail.isRefreshingDetail,
      isUpdatingDetail: visitDetail.isUpdatingDetail,
      isUploadingPhoto: visitDetail.isUploadingPhoto,
      isUpdatingStaff:
        visitDetail.isUpdatingStaff || visitOptions.isUpdatingStaff,
      isUpdatingStatus: visitDetail.isUpdatingStatus,
      optionsError: visitOptions.error,
      refreshVisitDetail: visitDetail.refreshVisitDetail,
      returnToCustomerId: normalizedReturnToCustomerId,
      services: visitOptions.services,
      skinners: visitOptions.skinners,
      updateVisitDetail,
      updateVisitStaff,
      updateVisitStatus,
      uploadVisitPhoto: visitDetail.uploadVisitPhoto,
      visit: visitDetail.visit,
    }),
    [
      backHref,
      normalizedReturnToCustomerId,
      updateVisitDetail,
      updateVisitStaff,
      updateVisitStatus,
      visitDetail.deleteVisitPhoto,
      visitDetail.error,
      visitDetail.isDeletingPhoto,
      visitDetail.isLoading,
      visitDetail.isRefreshingDetail,
      visitDetail.isUpdatingDetail,
      visitDetail.isUploadingPhoto,
      visitDetail.isUpdatingStaff,
      visitDetail.isUpdatingStatus,
      visitDetail.refreshVisitDetail,
      visitDetail.uploadVisitPhoto,
      visitDetail.visit,
      visitOptions.barbers,
      visitOptions.combos,
      visitOptions.createVisit,
      visitOptions.error,
      visitOptions.isCreating,
      visitOptions.isLoadingOptions,
      visitOptions.isUpdatingStaff,
      visitOptions.services,
      visitOptions.skinners,
    ],
  );

  return (
    <VisitContext.Provider value={value}>{children}</VisitContext.Provider>
  );
}

export function useVisitContext() {
  const context = useContext(VisitContext);

  if (!context) {
    throw new Error("useVisitContext must be used inside VisitProvider");
  }

  return context;
}

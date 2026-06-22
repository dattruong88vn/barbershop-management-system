"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Badge,
  Button,
  Card,
  Combobox,
  EmptyState,
  Error as FeedbackError,
  Input,
  PageTitle,
  Skeleton,
} from "@/components/global";
import {
  BRANCH_STATUS_ACTIVE,
  BRANCH_STATUS_INACTIVE,
  UI_VARIANT_SECONDARY,
} from "@/constants/common";
import { ROUTES } from "@/constants/routes";
import { branchTexts } from "@/constants/texts";
import { useBranches } from "@/hooks/useBranches";
import { useStaff } from "@/hooks/useStaff";
import { dispatchAppToast } from "@/lib/toast";
import { getStaffDisplayName } from "@/utils/staff";

import { BranchStaffTable } from "./BranchStaffTable";
import { BranchStaffTransferModal } from "./BranchStaffTransferModal";

export type BranchInformationMode = "create" | "detail" | "edit";

type BranchInformationScreenProps = {
  branchId?: string;
  mode: BranchInformationMode;
};

export function BranchInformationScreen({
  branchId,
  mode,
}: BranchInformationScreenProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [managerId, setManagerId] = useState("");
  const [formError, setFormError] = useState("");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [targetBranchId, setTargetBranchId] = useState("");
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferError, setTransferError] = useState("");
  const {
    branch: branchDetail,
    branches,
    createBranch,
    error: branchesError,
    isCreating,
    isLoading,
    isUpdating,
    managers,
    updateBranch,
  } = useBranches(true, true, branchId);
  const { isTransferring, transferStaff } = useStaff();
  const branch = branchDetail ?? branches.find((item) => item.id === branchId) ?? null;
  const isCreateMode = mode === "create";
  const isDetailMode = mode === "detail";
  const status = branch?.status ?? BRANCH_STATUS_ACTIVE;
  const isInactive = status === BRANCH_STATUS_INACTIVE;
  const isReadOnly = isDetailMode || isInactive;
  const branchStaff = branch?.staff ?? [];
  const managerOptions = useMemo(
    () => [
      { label: branchTexts.ownerBranches.noManagerOption, value: "" },
      ...managers.map((manager) => ({
        label: getStaffDisplayName(manager),
        value: manager.id,
      })),
    ],
    [managers],
  );
  const transferBranches = branches.filter(
    (item) => item.id !== branchId && (item.status ?? BRANCH_STATUS_ACTIVE) === BRANCH_STATUS_ACTIVE,
  );

  useEffect(() => {
    if (!branch) return;

    const timeoutId = window.setTimeout(() => {
      setName(branch.name);
      setAddress(branch.address);
      setManagerId(branch.manager?.id ?? "");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [branch]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const input = {
      address: address.trim(),
      managerId: managerId || null,
      name: name.trim(),
    };

    if (!input.name) {
      setFormError(branchTexts.ownerBranches.errors.missingName);
      return;
    }
    if (!input.address) {
      setFormError(branchTexts.ownerBranches.errors.missingAddress);
      return;
    }

    try {
      const savedBranch = isCreateMode
        ? await createBranch(input)
        : await updateBranch({ id: branchId ?? "", ...input });
      dispatchAppToast({
        message: isCreateMode
          ? branchTexts.ownerBranches.toast.created
          : branchTexts.ownerBranches.toast.updated,
        type: "success",
      });
      router.push(ROUTES.ownerBranchDetail(savedBranch.id));
    } catch (mutationError) {
      setFormError(
        mutationError instanceof Error
          ? mutationError.message
          : branchTexts.ownerBranches.errors.generic,
      );
    }
  }

  async function handleTransferStaff() {
    if (!targetBranchId || selectedStaffIds.length === 0) return;
    setTransferError("");

    try {
      await transferStaff({ staffIds: selectedStaffIds, targetBranchId });
      dispatchAppToast({
        message: branchTexts.ownerBranches.transferSuccess,
        type: "success",
      });
      setSelectedStaffIds([]);
      setTargetBranchId("");
      setIsTransferOpen(false);
    } catch (error) {
      setTransferError(
        error instanceof Error
          ? error.message
          : branchTexts.ownerBranches.errors.generic,
      );
    }
  }

  const title = isCreateMode
    ? branchTexts.ownerBranches.createTitle
    : isDetailMode
      ? branchTexts.ownerBranches.detailTitle
      : branchTexts.ownerBranches.editTitle;

  if (!isCreateMode && isLoading) {
    return (
      <div className="min-h-screen bg-gray-200 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  if (!isCreateMode && !branch) {
    return (
      <div className="min-h-screen bg-gray-200 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <EmptyState title={branchTexts.ownerBranches.branchNotFound} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 px-4 py-8 text-gray-1000 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="flex items-center justify-between gap-3">
          <PageTitle>{title}</PageTitle>
          {isDetailMode && branch && !isInactive ? (
            <Button
              type="button"
              onClick={() => router.push(ROUTES.ownerBranchEdit(branch.id))}
            >
              {branchTexts.ownerBranches.editAction}
            </Button>
          ) : null}
        </header>

        {branchesError ? (
          <FeedbackError
            message={
              branchesError.message ?? branchTexts.ownerBranches.errors.generic
            }
          />
        ) : null}
        {isInactive ? (
          <FeedbackError message={branchTexts.ownerBranches.readOnlyInactive} />
        ) : null}

        <Card padding="lg" title={branchTexts.ownerBranches.informationTitle}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {branch ? (
              <Badge variant={isInactive ? "default" : "success"}>
                {isInactive
                  ? branchTexts.ownerBranches.statuses.inactive
                  : branchTexts.ownerBranches.statuses.active}
              </Badge>
            ) : null}

            <label className="block">
              <span className="text-sm font-medium text-gray-1000">
                {branchTexts.ownerBranches.nameLabel}
              </span>
              <Input
                className="mt-2"
                disabled={isReadOnly}
                placeholder={branchTexts.ownerBranches.namePlaceholder}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-1000">
                {branchTexts.ownerBranches.addressLabel}
              </span>
              <Input
                className="mt-2"
                disabled={isReadOnly}
                placeholder={branchTexts.ownerBranches.addressPlaceholder}
                required
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </label>

            <div>
              <span className="text-sm font-medium text-gray-1000">
                {branchTexts.ownerBranches.managerLabel}
              </span>
              <div className="mt-2">
                {isReadOnly ? (
                  <Input
                    disabled
                    value={
                      branch?.manager
                        ? getStaffDisplayName(branch.manager)
                        : branchTexts.ownerBranches.unassignedManager
                    }
                  />
                ) : (
                  <Combobox
                    emptyMessage={branchTexts.ownerBranches.managerEmpty}
                    label={branchTexts.ownerBranches.managerLabel}
                    options={managerOptions}
                    placeholder={branchTexts.ownerBranches.managerPlaceholder}
                    searchable
                    searchPlaceholder={
                      branchTexts.ownerBranches.managerSearchPlaceholder
                    }
                    value={managerId}
                    onValueChange={setManagerId}
                  />
                )}
              </div>
            </div>

            {formError ? <FeedbackError message={formError} /> : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant={UI_VARIANT_SECONDARY}
                onClick={() =>
                  router.push(
                    branch
                      ? ROUTES.ownerBranchDetail(branch.id)
                      : ROUTES.ownerBranches,
                  )
                }
              >
                {isDetailMode
                  ? branchTexts.ownerBranches.backToList
                  : branchTexts.ownerBranches.cancel}
              </Button>
              {!isReadOnly ? (
                <Button
                  loading={isCreating || isUpdating}
                  type="submit"
                >
                  {isCreateMode
                    ? branchTexts.ownerBranches.submitCreate
                    : branchTexts.ownerBranches.submitUpdate}
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <BranchStaffTable
          isCreateMode={isCreateMode}
          isLoading={isLoading}
          staff={branchStaff}
          selectedStaffIds={selectedStaffIds}
          onSelectedStaffIdsChange={setSelectedStaffIds}
          onTransfer={() => setIsTransferOpen(true)}
        />
      </div>

      <BranchStaffTransferModal
        branches={transferBranches}
        error={transferError}
        isOpen={isTransferOpen}
        isTransferring={isTransferring}
        targetBranchId={targetBranchId}
        onConfirm={handleTransferStaff}
        onOpenChange={setIsTransferOpen}
        onTargetBranchIdChange={setTargetBranchId}
      />
    </div>
  );
}

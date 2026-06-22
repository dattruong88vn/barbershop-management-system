"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { FullScreenLoading, PageTitle } from "@/components/global";
import { BRANCH_STATUS_ACTIVE, BRANCH_STATUS_ALL } from "@/constants/common";
import { branchTexts } from "@/constants/texts";
import { useBranches } from "@/hooks/useBranches";
import { ROUTES } from "@/constants/routes";
import { dispatchAppToast } from "@/lib/toast";

import { BranchFilters } from "./BranchFilters";
import { BranchTable } from "./BranchTable";
import type { BranchFilters as BranchFiltersValue } from "./branchManagementTypes";

const DEFAULT_FILTERS: BranchFiltersValue = {
  search: "",
  status: BRANCH_STATUS_ALL,
};

export function BranchManagementScreen() {
  const router = useRouter();
  const [draftFilters, setDraftFilters] =
    useState<BranchFiltersValue>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<BranchFiltersValue>(DEFAULT_FILTERS);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const {
    branches,
    error: branchesError,
    isLoading,
    updateBranchStatus,
  } = useBranches();

  const filteredBranches = useMemo(() => {
    const search = appliedFilters.search.trim().toLowerCase();

    return branches.filter((branch) => {
      const status = branch.status ?? BRANCH_STATUS_ACTIVE;
      const matchesSearch = search
        ? `${branch.name} ${branch.address}`.toLowerCase().includes(search)
        : true;
      const matchesStatus =
        appliedFilters.status === BRANCH_STATUS_ALL ||
        status === appliedFilters.status;
      return matchesSearch && matchesStatus;
    });
  }, [appliedFilters, branches]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
  }

  const hasFilters =
    appliedFilters.search.trim().length > 0 ||
    appliedFilters.status !== BRANCH_STATUS_ALL;

  return (
    <>
      <div className="min-h-screen bg-gray-200 px-4 py-8 text-gray-1000 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <header>
            <PageTitle>{branchTexts.ownerBranches.title}</PageTitle>
          </header>
          <BranchFilters
            filters={draftFilters}
            onApply={applyFilters}
            onChange={setDraftFilters}
          />
          <BranchTable
            branches={filteredBranches}
            error={branchesError}
            hasFilters={hasFilters}
            isLoading={isLoading}
            onCreate={() => router.push(ROUTES.ownerBranchCreate)}
            onStatusChange={async (branch, status) => {
              setIsStatusUpdating(true);

              try {
                await updateBranchStatus({ id: branch.id, status });
                dispatchAppToast({
                  message:
                    status === BRANCH_STATUS_ACTIVE
                      ? branchTexts.ownerBranches.toast.activated
                      : branchTexts.ownerBranches.toast.deactivated,
                  type: "success",
                });
              } finally {
                setIsStatusUpdating(false);
              }
            }}
          />
        </div>
      </div>
      {isStatusUpdating ? (
        <FullScreenLoading message={branchTexts.ownerBranches.statusUpdating} />
      ) : null}
    </>
  );
}

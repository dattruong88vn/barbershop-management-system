"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PageTitle } from "@/components/global";
import {
  OwnerStaffDeleteModal,
  OwnerStaffDetailModal,
  OwnerStaffFilters,
  OwnerStaffTable,
  type StaffFilters,
} from "@/components/screens/owner-staff";
import {
  OWNER_STAFF_ROLES,
  STAFF_ROLES,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  type ManagementRoleValue,
} from "@/constants/common";
import { staffTexts } from "@/constants/texts";
import { ROUTES } from "@/constants/routes";
import { useBranches } from "@/hooks/useBranches";
import { useStaff } from "@/hooks/useStaff";
import { dispatchAppToast } from "@/lib/toast";
import type { Staff } from "@/types";
import {
  ALL_FILTER_VALUE,
  getStaffDisplayStatus,
  getStaffSearchText,
  STAFF_PAGE_SIZE,
} from "@/utils/staff";

export type StaffManagementMode = ManagementRoleValue;

type StaffManagementScreenProps = {
  mode: StaffManagementMode;
};

const DEFAULT_FILTERS: StaffFilters = {
  branchId: ALL_FILTER_VALUE,
  role: ALL_FILTER_VALUE,
  search: "",
  status: ALL_FILTER_VALUE,
};

export function StaffManagementScreen({ mode }: StaffManagementScreenProps) {
  const router = useRouter();
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [draftFilters, setDraftFilters] =
    useState<StaffFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<StaffFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const {
    staff,
    deleteStaff,
    error: staffError,
    isDeleting,
    isLoading,
  } = useStaff();
  const {
    branches,
    error: branchesError,
    isLoading: isLoadingBranches,
  } = useBranches();

  const isManagerMode = mode === USER_ROLE_MANAGER;
  const roleOptions =
    mode === USER_ROLE_OWNER ? [...OWNER_STAFF_ROLES] : [...STAFF_ROLES];
  const isBranchLocked = isManagerMode;

  const filteredStaff = useMemo(() => {
    const normalizedSearch = appliedFilters.search.trim().toLowerCase();

    return staff.filter((staffMember) => {
      const matchesSearch = normalizedSearch
        ? getStaffSearchText(staffMember).includes(normalizedSearch)
        : true;
      const matchesRole =
        appliedFilters.role === ALL_FILTER_VALUE ||
        staffMember.role === appliedFilters.role;
      const matchesBranch =
        isManagerMode ||
        appliedFilters.branchId === ALL_FILTER_VALUE ||
        staffMember.branchId === appliedFilters.branchId ||
        staffMember.managedBranches?.some(
          (branch) => branch.id === appliedFilters.branchId,
        );
      const matchesStatus =
        appliedFilters.status === ALL_FILTER_VALUE ||
        getStaffDisplayStatus(staffMember) === appliedFilters.status;

      return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });
  }, [appliedFilters, isManagerMode, staff]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStaff.length / STAFF_PAGE_SIZE),
  );
  const pageStartIndex = (page - 1) * STAFF_PAGE_SIZE;
  const visibleStaff = filteredStaff.slice(
    pageStartIndex,
    pageStartIndex + STAFF_PAGE_SIZE,
  );
  const pageStart = filteredStaff.length ? pageStartIndex + 1 : 0;
  const pageEnd = Math.min(
    pageStartIndex + STAFF_PAGE_SIZE,
    filteredStaff.length,
  );

  function openCreateModal() {
    router.push(
      isManagerMode ? ROUTES.managerStaffCreate : ROUTES.ownerStaffCreate,
    );
  }

  function handleEdit(staffMember: Staff) {
    router.push(
      isManagerMode
        ? ROUTES.managerStaffEdit(staffMember.id)
        : ROUTES.ownerStaffEdit(staffMember.id),
    );
  }

  function handleApplyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    setPage(1);
  }

  function closeDeleteModal(open: boolean) {
    if (!open) {
      setDeletingStaff(null);
      setError("");
    }
  }

  async function handleDelete() {
    if (!deletingStaff) {
      return;
    }

    setError("");

    try {
      await deleteStaff(deletingStaff.id);
      dispatchAppToast({
        message: staffTexts.ownerStaff.toast.deleted,
        type: "success",
      });
      setDeletingStaff(null);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : staffTexts.ownerStaff.errors.generic,
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 px-4 py-8 text-gray-1000 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header>
          <PageTitle>{staffTexts.ownerStaff.title}</PageTitle>
        </header>

        <OwnerStaffFilters
          branches={branches}
          draftFilters={draftFilters}
          isBranchLocked={isBranchLocked}
          roleOptions={roleOptions}
          onApplyFilters={handleApplyFilters}
          onDraftFiltersChange={setDraftFilters}
        />

        <OwnerStaffTable
          branchesError={branchesError}
          currentPage={page}
          isLoading={isLoading || isLoadingBranches}
          pageEnd={pageEnd}
          pageStart={pageStart}
          pageStartIndex={pageStartIndex}
          staff={visibleStaff}
          staffError={staffError}
          totalCount={filteredStaff.length}
          totalPages={totalPages}
          onCreate={openCreateModal}
          onDelete={setDeletingStaff}
          onEdit={handleEdit}
          onPageChange={setPage}
          onView={setViewingStaff}
        />
      </div>

      <OwnerStaffDetailModal
        staffMember={viewingStaff}
        onEdit={handleEdit}
        onOpenChange={(open) => {
          if (!open) {
            setViewingStaff(null);
          }
        }}
      />

      <OwnerStaffDeleteModal
        error={error}
        isDeleting={isDeleting}
        staffMember={deletingStaff}
        onConfirm={handleDelete}
        onOpenChange={closeDeleteModal}
      />
    </div>
  );
}

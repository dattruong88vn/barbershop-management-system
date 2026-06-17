"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { PageTitle } from "@/components/global";
import {
  OwnerStaffDeleteModal,
  OwnerStaffDetailModal,
  OwnerStaffFilters,
  OwnerStaffFormModal,
  OwnerStaffTable,
  type StaffFilters,
} from "@/components/screens/owner-staff";
import {
  USER_ROLE_MANAGER,
  USER_ROLE_RECEPTIONIST,
  type ManagementRoleValue,
} from "@/constants/common";
import { staffTexts } from "@/constants/texts";
import { useBranches } from "@/hooks/useBranches";
import { useStaff } from "@/hooks/useStaff";
import { dispatchAppToast } from "@/lib/toast";
import type { Staff, StaffRole } from "@/types";
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
  const { data: session } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>(USER_ROLE_RECEPTIONIST);
  const [branchId, setBranchId] = useState("");
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draftFilters, setDraftFilters] =
    useState<StaffFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<StaffFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const {
    staff,
    createStaff,
    deleteStaff,
    error: staffError,
    isCreating,
    isDeleting,
    isLoading,
    isUpdating,
    updateStaff,
  } = useStaff();
  const {
    branches,
    error: branchesError,
    isLoading: isLoadingBranches,
  } = useBranches();

  const isSubmitting = isCreating || isUpdating;
  const isManagerMode = mode === USER_ROLE_MANAGER;
  const managerBranchId = isManagerMode ? session?.user.branch_id : null;
  const effectiveBranchId = managerBranchId ?? branchId;
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
        staffMember.branchId === appliedFilters.branchId;
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

  function resetForm() {
    setUsername("");
    setPassword("");
    setRole(USER_ROLE_RECEPTIONIST);
    setBranchId("");
    setEditingStaff(null);
    setError("");
  }

  function openCreateModal() {
    resetForm();
    setBranchId(managerBranchId ?? "");
    setIsFormOpen(true);
  }

  function handleEdit(staffMember: Staff) {
    setUsername(staffMember.username);
    setPassword("");
    setRole(staffMember.role);
    setBranchId(managerBranchId ?? staffMember.branchId ?? "");
    setEditingStaff(staffMember);
    setViewingStaff(null);
    setError("");
    setIsFormOpen(true);
  }

  function closeFormModal(open: boolean) {
    setIsFormOpen(open);

    if (!open) {
      resetForm();
    }
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const staffInput = {
      username: username.trim(),
      password: password.trim() || undefined,
      role,
      branchId: effectiveBranchId,
    };

    if (!staffInput.username) {
      setError(staffTexts.ownerStaff.errors.missingUsername);
      return;
    }

    if (!editingStaff && !staffInput.password) {
      setError(staffTexts.ownerStaff.errors.missingPassword);
      return;
    }

    if (staffInput.password && staffInput.password.length < 8) {
      setError(staffTexts.ownerStaff.errors.passwordTooShort);
      return;
    }

    if (!staffInput.branchId) {
      setError(staffTexts.ownerStaff.errors.missingBranch);
      return;
    }

    try {
      if (editingStaff) {
        await updateStaff({
          id: editingStaff.id,
          ...staffInput,
        });
        dispatchAppToast({
          message: staffTexts.ownerStaff.toast.updated,
          type: "success",
        });
      } else {
        await createStaff(staffInput);
        dispatchAppToast({
          message: staffTexts.ownerStaff.toast.created,
          type: "success",
        });
      }

      closeFormModal(false);
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

      <OwnerStaffFormModal
        branchId={effectiveBranchId}
        branches={branches}
        editingStaff={editingStaff}
        error={error}
        isBranchLocked={isBranchLocked}
        isOpen={isFormOpen}
        isSubmitting={isSubmitting}
        password={password}
        role={role}
        username={username}
        onBranchIdChange={setBranchId}
        onOpenChange={closeFormModal}
        onPasswordChange={setPassword}
        onRoleChange={setRole}
        onSubmit={handleSubmit}
        onUsernameChange={setUsername}
      />

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

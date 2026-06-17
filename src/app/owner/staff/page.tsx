"use client";

import type { SyntheticEvent } from "react";
import { useMemo, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  Error as FeedbackError,
  Input,
  Modal,
  Pagination,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  type BadgeProps,
} from "@/components/global";
import { STAFF_ROLES, USER_ROLE_MANAGER } from "@/constants/common";
import { staffTexts } from "@/constants/texts";
import { useBranches } from "@/hooks/useBranches";
import { useStaff } from "@/hooks/useStaff";
import { dispatchAppToast } from "@/lib/toast";
import type { Staff, StaffRole } from "@/types";

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
});
const STAFF_PAGE_SIZE = 10;
const ALL_FILTER_VALUE = "all";
const STAFF_DISPLAY_STATUS_INITIALIZED = "initialized" as const;
const STAFF_DISPLAY_STATUS_ACTIVE = "active" as const;

type StaffDisplayStatus =
  | typeof STAFF_DISPLAY_STATUS_INITIALIZED
  | typeof STAFF_DISPLAY_STATUS_ACTIVE;
type StaffStatusFilter = StaffDisplayStatus | typeof ALL_FILTER_VALUE;
type StaffRoleFilter = StaffRole | typeof ALL_FILTER_VALUE;

type StaffFilters = {
  branchId: string;
  role: StaffRoleFilter;
  search: string;
  status: StaffStatusFilter;
};
type StaffBadgeVariant = NonNullable<BadgeProps["variant"]>;

const DEFAULT_FILTERS: StaffFilters = {
  branchId: ALL_FILTER_VALUE,
  role: ALL_FILTER_VALUE,
  search: "",
  status: ALL_FILTER_VALUE,
};
const STAFF_ROLE_BADGE_VARIANTS: Record<StaffRole, StaffBadgeVariant> = {
  barber: "info",
  receptionist: "warning",
  skinner: "success",
};
const STAFF_STATUS_BADGE_VARIANTS: Record<StaffDisplayStatus, StaffBadgeVariant> = {
  active: "info",
  initialized: "danger",
};

function formatPageSummary(start: number, end: number, total: number) {
  return staffTexts.ownerStaff.pageSummary
    .replace("{start}", String(start))
    .replace("{end}", String(end))
    .replace("{total}", String(total));
}

function getStaffSearchText(staffMember: Staff) {
  return [staffMember.username].join(" ").toLowerCase();
}

function getStaffDisplayStatus(staffMember: Staff): StaffDisplayStatus {
  return staffMember.isFirstLogin
    ? STAFF_DISPLAY_STATUS_INITIALIZED
    : STAFF_DISPLAY_STATUS_ACTIVE;
}

export default function OwnerStaffPage() {
  const { data: session } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("receptionist");
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
  const managerBranchId =
    session?.user.role === USER_ROLE_MANAGER ? session.user.branch_id : null;
  const isBranchLocked = Boolean(managerBranchId);

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
        appliedFilters.branchId === ALL_FILTER_VALUE ||
        (appliedFilters.branchId === ""
          ? staffMember.branchId === null
          : staffMember.branchId === appliedFilters.branchId);
      const matchesStatus =
        appliedFilters.status === ALL_FILTER_VALUE ||
        getStaffDisplayStatus(staffMember) === appliedFilters.status;

      return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });
  }, [appliedFilters, staff]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / STAFF_PAGE_SIZE));
  const pageStartIndex = (page - 1) * STAFF_PAGE_SIZE;
  const visibleStaff = filteredStaff.slice(
    pageStartIndex,
    pageStartIndex + STAFF_PAGE_SIZE,
  );
  const pageStart = filteredStaff.length ? pageStartIndex + 1 : 0;
  const pageEnd = Math.min(pageStartIndex + STAFF_PAGE_SIZE, filteredStaff.length);

  function resetForm() {
    setUsername("");
    setPassword("");
    setRole("receptionist");
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

  function handleApplyFilters(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    setPage(1);
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

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const staffInput = {
      username: username.trim(),
      password: password.trim() || undefined,
      role,
      branchId: branchId || null,
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
          <h1 className="text-2xl font-semibold">
            {staffTexts.ownerStaff.title}
          </h1>
        </header>

        <Card padding="lg" title={staffTexts.ownerStaff.filterTitle}>
          <form
            className="grid gap-4 lg:grid-cols-3"
            onSubmit={handleApplyFilters}
          >
            <label className="block">
              <span className="text-sm font-medium text-gray-1000">
                {staffTexts.ownerStaff.searchLabel}
              </span>
              <Input
                className="mt-2"
                placeholder={staffTexts.ownerStaff.searchPlaceholder}
                value={draftFilters.search}
                onChange={(event) =>
                  setDraftFilters((currentFilters) => ({
                    ...currentFilters,
                    search: event.target.value,
                  }))
                }
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-1000">
                {staffTexts.ownerStaff.roleLabel}
              </span>
              <Select
                className="mt-2"
                value={draftFilters.role}
                onChange={(event) =>
                  setDraftFilters((currentFilters) => ({
                    ...currentFilters,
                    role: event.target.value as StaffRoleFilter,
                  }))
                }
              >
                <option value={ALL_FILTER_VALUE}>
                  {staffTexts.ownerStaff.allRolesOption}
                </option>
                {STAFF_ROLES.map((staffRole) => (
                  <option key={staffRole} value={staffRole}>
                    {staffTexts.ownerStaff.roles[staffRole]}
                  </option>
                ))}
              </Select>
            </label>

            {!isBranchLocked ? (
              <label className="block">
                <span className="text-sm font-medium text-gray-1000">
                  {staffTexts.ownerStaff.branchLabel}
                </span>
                <Select
                  className="mt-2"
                  value={draftFilters.branchId}
                  onChange={(event) =>
                    setDraftFilters((currentFilters) => ({
                      ...currentFilters,
                      branchId: event.target.value,
                    }))
                  }
                >
                  <option value={ALL_FILTER_VALUE}>
                    {staffTexts.ownerStaff.allBranchesOption}
                  </option>
                  <option value="">
                    {staffTexts.ownerStaff.noBranchOption}
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </Select>
              </label>
            ) : null}

            <label className="block">
              <span className="text-sm font-medium text-gray-1000">
                {staffTexts.ownerStaff.statusLabel}
              </span>
              <Select
                className="mt-2"
                value={draftFilters.status}
                onChange={(event) =>
                  setDraftFilters((currentFilters) => ({
                    ...currentFilters,
                    status: event.target.value as StaffStatusFilter,
                  }))
                }
              >
                <option value={ALL_FILTER_VALUE}>
                  {staffTexts.ownerStaff.allStatusesOption}
                </option>
                <option value={STAFF_DISPLAY_STATUS_INITIALIZED}>
                  {staffTexts.ownerStaff.statuses.initialized}
                </option>
                <option value={STAFF_DISPLAY_STATUS_ACTIVE}>
                  {staffTexts.ownerStaff.statuses.active}
                </option>
              </Select>
            </label>

            <div className="flex items-end justify-end lg:col-span-3">
              <Button type="submit">{staffTexts.ownerStaff.applyFilters}</Button>
            </div>
          </form>
        </Card>

        <Card
          padding="lg"
          title={staffTexts.ownerStaff.listTitle}
          action={
            <Button
              icon={<Plus className="size-4" aria-hidden="true" />}
              type="button"
              onClick={openCreateModal}
            >
              {staffTexts.ownerStaff.createAction}
            </Button>
          }
        >
          {isLoading || isLoadingBranches ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : null}

          {staffError || branchesError ? (
            <FeedbackError
              message={
                staffError instanceof Error
                  ? staffError.message
                  : branchesError instanceof Error
                    ? branchesError.message
                    : staffTexts.ownerStaff.errors.generic
              }
            />
          ) : null}

          {!isLoading &&
          !isLoadingBranches &&
          !staffError &&
          !branchesError &&
          filteredStaff.length === 0 ? (
            <EmptyState title={staffTexts.ownerStaff.empty} />
          ) : null}

          {!isLoading &&
          !isLoadingBranches &&
          !staffError &&
          !branchesError &&
          filteredStaff.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-400">
              <Table>
                <TableHead>
                  <TableRow>
                    <th className="w-16 px-4 py-3 text-left font-semibold text-gray-1000">
                      {staffTexts.ownerStaff.table.index}
                    </th>
                    <th className="min-w-48 px-4 py-3 text-left font-semibold text-gray-1000">
                      {staffTexts.ownerStaff.table.username}
                    </th>
                    <th className="min-w-36 px-4 py-3 text-left font-semibold text-gray-1000">
                      {staffTexts.ownerStaff.table.role}
                    </th>
                    <th className="min-w-44 px-4 py-3 text-left font-semibold text-gray-1000">
                      {staffTexts.ownerStaff.table.branch}
                    </th>
                    <th className="min-w-32 px-4 py-3 text-left font-semibold text-gray-1000">
                      {staffTexts.ownerStaff.table.status}
                    </th>
                    <th className="min-w-36 px-4 py-3 text-left font-semibold text-gray-1000">
                      {staffTexts.ownerStaff.table.createdAt}
                    </th>
                    <th className="w-32 px-4 py-3 text-right font-semibold text-gray-1000">
                      {staffTexts.ownerStaff.table.actions}
                    </th>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleStaff.map((staffMember, index) => {
                    const displayStatus = getStaffDisplayStatus(staffMember);

                    return (
                      <TableRow key={staffMember.id}>
                        <TableCell>{pageStartIndex + index + 1}</TableCell>
                        <TableCell>
                          <button
                            className="min-h-11 cursor-pointer text-left font-bold text-gray-1000 underline-offset-4 hover:underline"
                            type="button"
                            onClick={() => setViewingStaff(staffMember)}
                          >
                            {staffMember.username}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge
                            size="sm"
                            variant={STAFF_ROLE_BADGE_VARIANTS[staffMember.role]}
                          >
                            {staffTexts.ownerStaff.roles[staffMember.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {staffMember.branch?.name ??
                            staffTexts.ownerStaff.branchEmpty}
                        </TableCell>
                        <TableCell>
                          <Badge
                            size="sm"
                            variant={STAFF_STATUS_BADGE_VARIANTS[displayStatus]}
                          >
                            {staffTexts.ownerStaff.statuses[displayStatus]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {DATE_FORMATTER.format(new Date(staffMember.createdAt))}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Tooltip content={staffTexts.ownerStaff.edit}>
                              <Button
                                aria-label={staffTexts.ownerStaff.edit}
                                className="size-10 px-0"
                                icon={
                                  <Edit2 className="size-4" aria-hidden="true" />
                                }
                                type="button"
                                variant="secondary"
                                onClick={() => handleEdit(staffMember)}
                              />
                            </Tooltip>
                            <Tooltip content={staffTexts.ownerStaff.delete}>
                              <Button
                                aria-label={staffTexts.ownerStaff.delete}
                                className="size-10 px-0"
                                icon={
                                  <Trash2 className="size-4" aria-hidden="true" />
                                }
                                type="button"
                                variant="danger"
                                onClick={() => setDeletingStaff(staffMember)}
                              />
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : null}

          {filteredStaff.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
              <p>{formatPageSummary(pageStart, pageEnd, filteredStaff.length)}</p>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </Card>
      </div>

      <Modal
        open={isFormOpen}
        title={
          editingStaff
            ? staffTexts.ownerStaff.editTitle
            : staffTexts.ownerStaff.createTitle
        }
        onOpenChange={closeFormModal}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-gray-1000">
              {staffTexts.ownerStaff.usernameLabel}
            </span>
            <Input
              className="mt-2"
              placeholder={staffTexts.ownerStaff.usernamePlaceholder}
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-1000">
              {staffTexts.ownerStaff.passwordLabel}
            </span>
            <Input
              className="mt-2"
              minLength={editingStaff ? undefined : 8}
              placeholder={staffTexts.ownerStaff.passwordPlaceholder}
              required={!editingStaff}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-1000">
              {staffTexts.ownerStaff.roleLabel}
            </span>
            <Select
              className="mt-2"
              value={role}
              onChange={(event) => setRole(event.target.value as StaffRole)}
            >
              {STAFF_ROLES.map((staffRole) => (
                <option key={staffRole} value={staffRole}>
                  {staffTexts.ownerStaff.roles[staffRole]}
                </option>
              ))}
            </Select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-1000">
              {staffTexts.ownerStaff.branchLabel}
            </span>
            <Select
              className="mt-2"
              disabled={isBranchLocked}
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
            >
              {!isBranchLocked ? (
                <option value="">{staffTexts.ownerStaff.noBranchOption}</option>
              ) : null}
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </label>

          {error ? <FeedbackError message={error} /> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => closeFormModal(false)}
            >
              {staffTexts.ownerStaff.cancelEdit}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editingStaff
                ? staffTexts.ownerStaff.submitUpdate
                : staffTexts.ownerStaff.submitCreate}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(viewingStaff)}
        title={staffTexts.ownerStaff.detailTitle}
        onOpenChange={(open) => {
          if (!open) {
            setViewingStaff(null);
          }
        }}
      >
        {viewingStaff ? (
          <div>
            <div className="overflow-hidden rounded-lg border border-gray-400">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="w-1/2 bg-gray-200 font-medium">
                      {staffTexts.ownerStaff.usernameLabel}
                    </TableCell>
                    <TableCell>{viewingStaff.username}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="w-1/2 bg-gray-200 font-medium">
                      {staffTexts.ownerStaff.roleLabel}
                    </TableCell>
                    <TableCell>
                      <Badge
                        size="sm"
                        variant={STAFF_ROLE_BADGE_VARIANTS[viewingStaff.role]}
                      >
                        {staffTexts.ownerStaff.roles[viewingStaff.role]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="w-1/2 bg-gray-200 font-medium">
                      {staffTexts.ownerStaff.branchLabel}
                    </TableCell>
                    <TableCell>
                      {viewingStaff.branch?.name ??
                        staffTexts.ownerStaff.branchEmpty}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="w-1/2 bg-gray-200 font-medium">
                      {staffTexts.ownerStaff.statusLabel}
                    </TableCell>
                    <TableCell>
                      <Badge
                        size="sm"
                        variant={
                          STAFF_STATUS_BADGE_VARIANTS[
                            getStaffDisplayStatus(viewingStaff)
                          ]
                        }
                      >
                        {
                          staffTexts.ownerStaff.statuses[
                            getStaffDisplayStatus(viewingStaff)
                          ]
                        }
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="w-1/2 bg-gray-200 font-medium">
                      {staffTexts.ownerStaff.createdAtLabel}
                    </TableCell>
                    <TableCell>
                      {DATE_FORMATTER.format(new Date(viewingStaff.createdAt))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleEdit(viewingStaff)}
              >
                {staffTexts.ownerStaff.edit}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        description={staffTexts.ownerStaff.deleteConfirmDescription}
        open={Boolean(deletingStaff)}
        title={staffTexts.ownerStaff.deleteConfirmTitle}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingStaff(null);
            setError("");
          }
        }}
      >
        {error ? <FeedbackError className="mb-4" message={error} /> : null}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDeletingStaff(null);
              setError("");
            }}
          >
            {staffTexts.ownerStaff.deleteCancel}
          </Button>
          <Button
            loading={isDeleting}
            type="button"
            variant="danger"
            onClick={handleDelete}
          >
            {staffTexts.ownerStaff.delete}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

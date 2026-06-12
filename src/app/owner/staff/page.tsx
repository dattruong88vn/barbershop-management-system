"use client";

import type { SyntheticEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/global/ui/button";
import { STAFF_ROLES } from "@/constants/common";
import { staffTexts } from "@/constants/texts";
import { useBranches } from "@/hooks/useBranches";
import { useStaff } from "@/hooks/useStaff";
import type { Staff, StaffRole } from "@/types";

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
});

export default function OwnerStaffPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("receptionist");
  const [branchId, setBranchId] = useState("");
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
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

  function resetForm() {
    setUsername("");
    setPassword("");
    setRole("receptionist");
    setBranchId("");
    setEditingStaff(null);
    setError("");
  }

  function handleEdit(staffMember: Staff) {
    setUsername(staffMember.username);
    setPassword("");
    setRole(staffMember.role);
    setBranchId(staffMember.branchId ?? "");
    setEditingStaff(staffMember);
    setError("");
  }

  async function handleDelete(staffMember: Staff) {
    const isConfirmed = window.confirm(staffTexts.ownerStaff.deleteConfirm);

    if (!isConfirmed) {
      return;
    }

    setError("");

    try {
      await deleteStaff(staffMember.id);
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
      } else {
        await createStaff(staffInput);
      }

      resetForm();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : staffTexts.ownerStaff.errors.generic,
      );
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
        <section>
          <h1 className="text-2xl font-semibold">
            {staffTexts.ownerStaff.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {staffTexts.ownerStaff.description}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold">
              {editingStaff
                ? staffTexts.ownerStaff.editTitle
                : staffTexts.ownerStaff.createTitle}
            </h2>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-zinc-800">
                  {staffTexts.ownerStaff.usernameLabel}
                </span>
                <input
                  type="text"
                  value={username}
                  required
                  placeholder={staffTexts.ownerStaff.usernamePlaceholder}
                  onChange={(event) => setUsername(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-800">
                  {staffTexts.ownerStaff.passwordLabel}
                </span>
                <input
                  type="password"
                  value={password}
                  minLength={editingStaff ? undefined : 8}
                  required={!editingStaff}
                  placeholder={staffTexts.ownerStaff.passwordPlaceholder}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-800">
                  {staffTexts.ownerStaff.roleLabel}
                </span>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as StaffRole)}
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
                >
                  {STAFF_ROLES.map((staffRole) => (
                    <option key={staffRole} value={staffRole}>
                      {staffTexts.ownerStaff.roles[staffRole]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-800">
                  {staffTexts.ownerStaff.branchLabel}
                </span>
                <select
                  value={branchId}
                  onChange={(event) => setBranchId(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950"
                >
                  <option value="">
                    {staffTexts.ownerStaff.noBranchOption}
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {isLoadingBranches ? (
                  <span className="mt-2 block text-sm text-zinc-600">
                    {staffTexts.ownerStaff.loading}
                  </span>
                ) : null}
                {branchesError ? (
                  <span className="mt-2 block text-sm text-red-700">
                    {branchesError instanceof Error
                      ? branchesError.message
                      : staffTexts.ownerStaff.errors.generic}
                  </span>
                ) : null}
              </label>
            </div>

            {error ? (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                variant="primary"
                className="h-11"
                disabled={isSubmitting}
              >
                {editingStaff
                  ? staffTexts.ownerStaff.submitUpdate
                  : staffTexts.ownerStaff.submitCreate}
              </Button>
              {editingStaff ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11"
                  onClick={resetForm}
                >
                  {staffTexts.ownerStaff.cancelEdit}
                </Button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          {isLoading ? (
            <p className="p-5 text-sm text-zinc-600">
              {staffTexts.ownerStaff.loading}
            </p>
          ) : null}

          {staffError ? (
            <p className="m-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {staffError instanceof Error
                ? staffError.message
                : staffTexts.ownerStaff.errors.generic}
            </p>
          ) : null}

          {!isLoading && !staffError && staff.length === 0 ? (
            <p className="p-5 text-sm text-zinc-600">
              {staffTexts.ownerStaff.empty}
            </p>
          ) : null}

          {staff.length ? (
            <div className="divide-y divide-zinc-200">
              {staff.map((staffMember) => (
                <article key={staffMember.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold">
                        {staffMember.username}
                      </h2>
                      <p className="mt-2 text-sm text-zinc-600">
                        {staffTexts.ownerStaff.roles[staffMember.role]}
                      </p>
                      <p className="mt-2 text-sm text-zinc-600">
                        {staffMember.branch?.name ??
                          staffTexts.ownerStaff.branchEmpty}
                      </p>
                      {staffMember.isFirstLogin ? (
                        <p className="mt-2 text-sm font-medium text-zinc-800">
                          {staffTexts.ownerStaff.firstLoginLabel}
                        </p>
                      ) : null}
                      <p className="mt-3 text-xs text-zinc-500">
                        <span>{staffTexts.ownerStaff.createdAtLabel}</span>
                        <span className="ml-1">
                          {DATE_FORMATTER.format(new Date(staffMember.createdAt))}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9"
                        onClick={() => handleEdit(staffMember)}
                      >
                        {staffTexts.ownerStaff.edit}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="h-9"
                        disabled={isDeleting}
                        onClick={() => handleDelete(staffMember)}
                      >
                        {isDeleting
                          ? staffTexts.ownerStaff.deleting
                          : staffTexts.ownerStaff.delete}
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

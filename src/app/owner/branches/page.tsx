"use client";

import type { SyntheticEvent } from "react";
import { useState } from "react";

import { PageTitle } from "@/components/global";
import { Button } from "@/components/global/ui/button";
import { branchTexts } from "@/constants/texts";
import { useBranches } from "@/hooks/useBranches";
import type { Branch } from "@/types";
import { formatDisplayDate } from "@/utils/common";

export default function OwnerBranchesPage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [error, setError] = useState("");
  const {
    branches,
    createBranch,
    deleteBranch,
    error: branchesError,
    isCreating,
    isDeleting,
    isLoading,
    isUpdating,
    updateBranch,
  } = useBranches();

  const isSubmitting = isCreating || isUpdating;

  function resetForm() {
    setName("");
    setAddress("");
    setEditingBranch(null);
    setError("");
  }

  function handleEdit(branch: Branch) {
    setName(branch.name);
    setAddress(branch.address);
    setEditingBranch(branch);
    setError("");
  }

  async function handleDelete(branch: Branch) {
    const isConfirmed = window.confirm(
      branchTexts.ownerBranches.deleteConfirm,
    );

    if (!isConfirmed) {
      return;
    }

    setError("");

    try {
      await deleteBranch(branch.id);
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : branchTexts.ownerBranches.errors.generic,
      );
    }
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const branchInput = {
      name: name.trim(),
      address: address.trim(),
    };

    if (!branchInput.name) {
      setError(branchTexts.ownerBranches.errors.missingName);
      return;
    }

    if (!branchInput.address) {
      setError(branchTexts.ownerBranches.errors.missingAddress);
      return;
    }

    try {
      if (editingBranch) {
        await updateBranch({
          id: editingBranch.id,
          ...branchInput,
        });
      } else {
        await createBranch(branchInput);
      }

      resetForm();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : branchTexts.ownerBranches.errors.generic,
      );
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
        <section>
          <PageTitle>{branchTexts.ownerBranches.title}</PageTitle>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {branchTexts.ownerBranches.description}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold">
              {editingBranch
                ? branchTexts.ownerBranches.editTitle
                : branchTexts.ownerBranches.createTitle}
            </h2>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-zinc-800">
                  {branchTexts.ownerBranches.nameLabel}
                </span>
                <input
                  type="text"
                  value={name}
                  required
                  placeholder={branchTexts.ownerBranches.namePlaceholder}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-base text-zinc-950 outline-none transition focus:border-zinc-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-800">
                  {branchTexts.ownerBranches.addressLabel}
                </span>
                <input
                  type="text"
                  value={address}
                  required
                  placeholder={branchTexts.ownerBranches.addressPlaceholder}
                  onChange={(event) => setAddress(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-zinc-300 px-3 text-base text-zinc-950 outline-none transition focus:border-zinc-950"
                />
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
                {editingBranch
                  ? branchTexts.ownerBranches.submitUpdate
                  : branchTexts.ownerBranches.submitCreate}
              </Button>
              {editingBranch ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11"
                  onClick={resetForm}
                >
                  {branchTexts.ownerBranches.cancelEdit}
                </Button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          {isLoading ? (
            <p className="p-5 text-sm text-zinc-600">
              {branchTexts.ownerBranches.loading}
            </p>
          ) : null}

          {branchesError ? (
            <p className="m-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {branchesError instanceof Error
                ? branchesError.message
                : branchTexts.ownerBranches.errors.generic}
            </p>
          ) : null}

          {!isLoading && !branchesError && branches.length === 0 ? (
            <p className="p-5 text-sm text-zinc-600">
              {branchTexts.ownerBranches.empty}
            </p>
          ) : null}

          {branches.length ? (
            <div className="divide-y divide-zinc-200">
              {branches.map((branch) => (
                <article key={branch.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold">
                        {branch.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        {branch.address}
                      </p>
                      <p className="mt-3 text-xs text-zinc-500">
                        <span>{branchTexts.ownerBranches.createdAtLabel}</span>
                        <span className="ml-1">
                          {formatDisplayDate(branch.createdAt)}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9"
                        onClick={() => handleEdit(branch)}
                      >
                        {branchTexts.ownerBranches.edit}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="h-9"
                        disabled={isDeleting}
                        onClick={() => handleDelete(branch)}
                      >
                        {isDeleting
                          ? branchTexts.ownerBranches.deleting
                          : branchTexts.ownerBranches.delete}
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

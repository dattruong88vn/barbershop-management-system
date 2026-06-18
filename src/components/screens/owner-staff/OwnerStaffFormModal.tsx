import type { FormEvent } from "react";

import {
  Button,
  Error as FeedbackError,
  Input,
  Modal,
  MultiSelect,
  Select,
} from "@/components/global";
import {
  BRANCH_STATUS_ACTIVE,
  UI_VARIANT_SECONDARY,
  USER_ROLE_MANAGER,
} from "@/constants/common";
import { staffTexts } from "@/constants/texts";
import type { Branch, Staff, StaffRole } from "@/types";

type OwnerStaffFormModalProps = {
  branchId: string;
  branches: Branch[];
  editingStaff: Staff | null;
  error: string;
  isBranchLocked: boolean;
  isOpen: boolean;
  isSubmitting: boolean;
  managedBranchIds: string[];
  onBranchIdChange: (branchId: string) => void;
  onManagedBranchIdsChange: (branchIds: string[]) => void;
  onOpenChange: (open: boolean) => void;
  onPasswordChange: (password: string) => void;
  onRoleChange: (role: StaffRole) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUsernameChange: (username: string) => void;
  password: string;
  role: StaffRole;
  roleOptions: StaffRole[];
  username: string;
};

export function OwnerStaffFormModal({
  branchId,
  branches,
  editingStaff,
  error,
  isBranchLocked,
  isOpen,
  isSubmitting,
  managedBranchIds,
  onBranchIdChange,
  onManagedBranchIdsChange,
  onOpenChange,
  onPasswordChange,
  onRoleChange,
  onSubmit,
  onUsernameChange,
  password,
  role,
  roleOptions,
  username,
}: OwnerStaffFormModalProps) {
  const isManagerRole = role === USER_ROLE_MANAGER;
  const activeBranches = branches.filter(
    (branch) =>
      (branch.status ?? BRANCH_STATUS_ACTIVE) === BRANCH_STATUS_ACTIVE,
  );

  return (
    <Modal
      open={isOpen}
      title={
        editingStaff
          ? staffTexts.ownerStaff.editTitle
          : staffTexts.ownerStaff.createTitle
      }
      onOpenChange={onOpenChange}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {staffTexts.ownerStaff.usernameLabel}
          </span>
          <Input
            className="mt-2"
            placeholder={staffTexts.ownerStaff.usernamePlaceholder}
            required
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
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
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {staffTexts.ownerStaff.roleLabel}
          </span>
          <Select
            className="mt-2"
            value={role}
            onChange={(event) => onRoleChange(event.target.value as StaffRole)}
          >
            {roleOptions.map((staffRole) => (
              <option key={staffRole} value={staffRole}>
                {staffTexts.ownerStaff.roles[staffRole]}
              </option>
            ))}
          </Select>
        </label>

        {isManagerRole ? (
          <label className="block">
            <span className="text-sm font-medium text-gray-1000">
              {staffTexts.ownerStaff.managedBranchesLabel}
            </span>
            <MultiSelect
              className="mt-2"
              options={activeBranches.map((branch) => ({
                label: branch.name,
                value: branch.id,
              }))}
              placeholder={staffTexts.ownerStaff.managedBranchesPlaceholder}
              searchable
              searchPlaceholder={
                staffTexts.ownerStaff.managedBranchesPlaceholder
              }
              value={managedBranchIds}
              onChange={onManagedBranchIdsChange}
            />
          </label>
        ) : (
          <label className="block">
            <span className="text-sm font-medium text-gray-1000">
              {staffTexts.ownerStaff.branchLabel}
            </span>
            <Select
              className="mt-2"
              disabled={isBranchLocked}
              required
              value={branchId}
              onChange={(event) => onBranchIdChange(event.target.value)}
            >
              <option disabled value="">
                {staffTexts.ownerStaff.branchPlaceholder}
              </option>
              {activeBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </label>
        )}

        {error ? <FeedbackError message={error} /> : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant={UI_VARIANT_SECONDARY}
            onClick={() => onOpenChange(false)}
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
  );
}

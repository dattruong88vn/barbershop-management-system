import type { FormEvent } from "react";

import {
  Button,
  Error as FeedbackError,
  Input,
  Modal,
  Select,
} from "@/components/global";
import {
  STAFF_ROLES,
  UI_VARIANT_SECONDARY,
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
  onBranchIdChange: (branchId: string) => void;
  onOpenChange: (open: boolean) => void;
  onPasswordChange: (password: string) => void;
  onRoleChange: (role: StaffRole) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUsernameChange: (username: string) => void;
  password: string;
  role: StaffRole;
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
  onBranchIdChange,
  onOpenChange,
  onPasswordChange,
  onRoleChange,
  onSubmit,
  onUsernameChange,
  password,
  role,
  username,
}: OwnerStaffFormModalProps) {
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
            required
            value={branchId}
            onChange={(event) => onBranchIdChange(event.target.value)}
          >
            <option disabled value="">
              {staffTexts.ownerStaff.branchPlaceholder}
            </option>
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

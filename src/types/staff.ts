import type { OwnerStaffRoleValue } from "@/constants/common";

export type StaffRole = OwnerStaffRoleValue;

export type StaffStatus = "active" | "inactive" | "branch_suspended";

export type StaffBranch = {
  id: string;
  name: string;
};

export type Staff = {
  id: string;
  shopId: string;
  branchId: string | null;
  username: string;
  role: StaffRole;
  status: StaffStatus;
  isFirstLogin: boolean;
  createdAt: string;
  branch: StaffBranch | null;
  managedBranches?: StaffBranch[];
};

export type StaffFormInput = {
  username: string;
  password?: string;
  role: StaffRole;
  branchId: string | null;
  managedBranchIds?: string[];
};

export type StaffRequestBody = {
  username?: unknown;
  password?: unknown;
  role?: unknown;
  branchId?: unknown;
  managedBranchIds?: unknown;
};

export type StaffListApiResponse = {
  staff: Staff[];
};

export type StaffApiResponse = {
  staffMember?: Staff;
  error?: string;
};

export type StaffTransferInput = {
  staffIds: string[];
  targetBranchId: string;
};

export type StaffTransferApiResponse = {
  transferredCount?: number;
  error?: string;
};

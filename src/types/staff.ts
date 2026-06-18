import type { StaffRoleValue } from "@/constants/common";

export type StaffRole = StaffRoleValue;

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
};

export type StaffFormInput = {
  username: string;
  password?: string;
  role: StaffRole;
  branchId: string | null;
};

export type StaffRequestBody = {
  username?: unknown;
  password?: unknown;
  role?: unknown;
  branchId?: unknown;
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

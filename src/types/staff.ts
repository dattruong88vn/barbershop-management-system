import type { OwnerStaffRoleValue, StaffGenderValue } from "@/constants/common";

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
  fullName?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: StaffGenderValue | null;
  hometown?: string | null;
  currentAddress?: string | null;
  identityCardFrontUrl?: string | null;
  identityCardBackUrl?: string | null;
  hasIdentityCardFront?: boolean;
  hasIdentityCardBack?: boolean;
  role: StaffRole;
  status: StaffStatus;
  isFirstLogin: boolean;
  createdAt: string;
  branch: StaffBranch | null;
  managedBranches?: StaffBranch[];
};

export type StaffFormInput = {
  username: string;
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: StaffGenderValue;
  hometown?: string;
  currentAddress?: string;
  identityCardFrontKey?: string;
  identityCardBackKey?: string;
  password?: string;
  role: StaffRole;
  branchId: string | null;
  managedBranchIds?: string[];
};

export type StaffRequestBody = {
  username?: unknown;
  fullName?: unknown;
  phone?: unknown;
  dateOfBirth?: unknown;
  gender?: unknown;
  hometown?: unknown;
  currentAddress?: unknown;
  identityCardFrontKey?: unknown;
  identityCardBackKey?: unknown;
  password?: unknown;
  role?: unknown;
  branchId?: unknown;
  managedBranchIds?: unknown;
};

export type StaffIdentitySide = "front" | "back";

export type StaffIdentityUploadInput = {
  draftId: string;
  fileType: string;
  side: StaffIdentitySide;
};

export type StaffIdentityUploadApiResponse = {
  error?: string;
  key?: string;
  url?: string;
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

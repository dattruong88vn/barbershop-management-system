import type { BranchStatusValue } from "@/constants/common";

export type Branch = {
  id: string;
  shopId: string;
  name: string;
  address: string;
  createdAt: string;
  manager?: {
    id: string;
    username: string;
  } | null;
  status?: BranchStatusValue;
  canDeactivate?: boolean;
};

export type BranchFormInput = {
  name: string;
  address: string;
  managerId?: string | null;
};

export type BranchRequestBody = {
  name?: unknown;
  address?: unknown;
  managerId?: unknown;
};

export type BranchListApiResponse = {
  branches: Branch[];
};

export type BranchApiResponse = {
  branch?: Branch;
  error?: string;
};

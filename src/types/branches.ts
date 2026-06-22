import type { BranchStatusValue } from "@/constants/common";
import type { Staff } from "./staff";

export type Branch = {
  id: string;
  shopId: string;
  name: string;
  address: string;
  managerId?: string | null;
  createdAt: string;
  manager?: {
    fullName?: string | null;
    id: string;
    username: string;
  } | null;
  status?: BranchStatusValue;
  canDeactivate?: boolean;
  staff?: Staff[];
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

export type BranchManager = {
  fullName?: string | null;
  id: string;
  username: string;
};

export type BranchManagerListApiResponse = {
  managers: BranchManager[];
};

export type BranchApiResponse = {
  branch?: Branch;
  error?: string;
};

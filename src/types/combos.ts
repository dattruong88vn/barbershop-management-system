import type { ServiceScopeValue } from "@/constants/common";

export type ComboService = {
  id: string;
  name: string;
  price: number;
  isHaircut: boolean;
};

export type Combo = {
  branch?: {
    id: string;
    name: string;
  } | null;
  branchId?: string | null;
  canDelete?: boolean;
  canEdit?: boolean;
  createdAt: string;
  createdBy?: string;
  creator?: {
    fullName?: string | null;
    id: string;
    role: string;
    username: string;
  };
  deletedAt?: string | null;
  description: string;
  id: string;
  isUsedInVisit?: boolean;
  name: string;
  price: number;
  scope?: ServiceScopeValue;
  services: ComboService[];
  shopId: string;
};

export type ComboFormInput = {
  name: string;
  description: string;
  price: number;
  serviceIds: string[];
};

export type ComboRequestBody = {
  name?: unknown;
  description?: unknown;
  price?: unknown;
  serviceIds?: unknown;
};

export type ComboListApiResponse = {
  combos: Combo[];
};

export type ComboApiResponse = {
  combo?: Combo;
  error?: string;
};

import type {
  ServiceResponsibleRoleValue,
  ServiceScopeValue,
} from "@/constants/common";

export type Service = {
  branch: {
    id: string;
    name: string;
  } | null;
  branchId: string | null;
  canDelete: boolean;
  canEdit: boolean;
  createdAt: string;
  createdBy: string;
  creator: {
    id: string;
    role: string;
    username: string;
  };
  deletedAt: string | null;
  id: string;
  isHaircut: boolean;
  name: string;
  price: number;
  responsibleRole: ServiceResponsibleRoleValue;
  scope: ServiceScopeValue;
  shopId: string;
};

export type ServiceFormInput = {
  name: string;
  price: number;
  responsibleRole: ServiceResponsibleRoleValue;
  isHaircut: boolean;
};

export type ServiceRequestBody = {
  name?: unknown;
  price?: unknown;
  responsibleRole?: unknown;
  isHaircut?: unknown;
};

export type ServiceListApiResponse = {
  services: Service[];
};

export type ServiceApiResponse = {
  service?: Service;
  error?: string;
};

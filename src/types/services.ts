import type { ServiceResponsibleRoleValue } from "@/constants/common";

export type Service = {
  id: string;
  shopId: string;
  name: string;
  price: number;
  responsibleRole: ServiceResponsibleRoleValue;
  isHaircut: boolean;
  createdAt: string;
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

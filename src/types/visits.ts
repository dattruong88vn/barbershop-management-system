import type { ChangeEventHandler, FormEventHandler } from "react";
import type { Customer, CustomerVisit } from "./customers";
import type { StaffRole } from "./staff";

export type VisitCreateItem = {
  id: string;
  name: string;
  price: number;
};

export type VisitCreateStaff = {
  id: string;
  username: string;
  role: StaffRole;
};

export type VisitCreateOptions = {
  services: VisitCreateItem[];
  combos: VisitCreateItem[];
  barbers: VisitCreateStaff[];
  skinners: VisitCreateStaff[];
};

export type VisitCreateOptionsApiResponse = VisitCreateOptions & {
  error?: string;
};

export type VisitCreateInput = {
  customerId: string;
  serviceIds: string[];
  comboIds: string[];
  barberId: string | null;
  skinnerId: string | null;
};

export type VisitRequestBody = {
  customerId?: unknown;
  serviceIds?: unknown;
  comboIds?: unknown;
  barberId?: unknown;
  skinnerId?: unknown;
};

export type VisitStaffUpdateInput = {
  visitId: string;
  customerId: string;
  barberId: string | null;
  skinnerId: string | null;
};

export type VisitStaffUpdateRequestBody = {
  barberId?: unknown;
  skinnerId?: unknown;
};

export type VisitApiResponse = {
  visit?: CustomerVisit;
  error?: string;
};

export type VisitDetailApiResponse = {
  visit?: CustomerVisit;
  error?: string;
};

export type VisitCreateFormProps = {
  customerId: string;
  suggestions: {
    services: Array<{
      itemId: string | null;
      type: "service" | "combo";
    }>;
    barber: {
      id: string;
    } | null;
    skinner: {
      id: string;
    } | null;
  } | null;
};

export type VisitDetailViewProps = {
  barbers: VisitCreateStaff[];
  error: unknown;
  isLoading: boolean;
  isUpdatingStaff: boolean;
  skinners: VisitCreateStaff[];
  updateError: string;
  visit: CustomerVisit | null;
  onUpdateError: (error: string) => void;
  onUpdateStaff: (input: VisitStaffUpdateInput) => Promise<CustomerVisit>;
};

export type VisitStaffEditFormProps = {
  barbers: VisitCreateStaff[];
  isUpdatingStaff: boolean;
  skinners: VisitCreateStaff[];
  visit: CustomerVisit;
  onCancel: () => void;
  onError: (error: string) => void;
  onUpdateStaff: (input: VisitStaffUpdateInput) => Promise<CustomerVisit>;
};

export type VisitCreatePageViewProps = {
  activeSearch: string;
  customers: Customer[];
  customersError: unknown;
  isLoadingCustomers: boolean;
  searchInput: string;
  selectedCustomer: Customer | null;
  onClearSelectedCustomer: () => void;
  onSearch: FormEventHandler<HTMLFormElement>;
  onSearchInputChange: ChangeEventHandler<HTMLInputElement>;
  onSelectCustomer: (customer: Customer) => void;
};

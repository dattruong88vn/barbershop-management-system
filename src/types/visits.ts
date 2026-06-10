import type { ChangeEventHandler, FormEventHandler } from "react";
import type {
  Customer,
  CustomerVisit,
  CustomerVisitPhoto,
  CustomerVisitStatus,
} from "./customers";
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

export type VisitListItem = CustomerVisit & {
  customer: {
    id: string;
    name: string;
    phone: string;
  };
};

export type VisitListApiResponse = {
  visits: VisitListItem[];
  error?: string;
};

export type VisitListStatusFilter = CustomerVisitStatus;

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

export type VisitPhotoCreateInput = {
  key: string;
  visitId: string;
};

export type VisitPhotoCreateRequestBody = {
  key?: unknown;
};

export type VisitPhotoUploadInput = {
  file: File;
  visitId: string;
};

export type VisitApiResponse = {
  visit?: CustomerVisit;
  error?: string;
};

export type VisitPhotoApiResponse = {
  photo?: CustomerVisitPhoto;
  error?: string;
};

export type VisitPresignedUploadApiResponse = {
  error?: string;
  key?: string;
  url?: string;
};

export type VisitPresignedUploadInput = {
  fileType: string;
  visitId: string;
};

export type VisitDetailApiResponse = {
  visit?: CustomerVisit;
  error?: string;
};

export type VisitCreateFormProps = {
  returnToCustomerId?: string | null;
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
  backHref: string;
  error: unknown;
  isLoading: boolean;
  isUploadingPhoto: boolean;
  isUpdatingStaff: boolean;
  skinners: VisitCreateStaff[];
  updateError: string;
  visit: CustomerVisit | null;
  onUploadPhoto: (input: VisitPhotoUploadInput) => Promise<CustomerVisitPhoto>;
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
  backHref: string;
  customers: Customer[];
  customersError: unknown;
  isLoadingCustomers: boolean;
  searchInput: string;
  selectedCustomer: Customer | null;
  returnToCustomerId: string | null;
  onClearSelectedCustomer: () => void;
  onSearch: FormEventHandler<HTMLFormElement>;
  onSearchInputChange: ChangeEventHandler<HTMLInputElement>;
  onSelectCustomer: (customer: Customer) => void;
};

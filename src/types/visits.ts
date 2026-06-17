import type { ChangeEventHandler, FormEventHandler, ReactNode } from "react";
import type { VisitItemTypeValue } from "@/constants/common";
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
  noHaircut?: boolean;
  skinnerId: string | null;
  noSkinnerService?: boolean;
};

export type VisitStaffUpdateRequestBody = {
  barberId?: unknown;
  noHaircut?: unknown;
  skinnerId?: unknown;
  noSkinnerService?: unknown;
};

export type VisitDetailUpdateInput = {
  comboIds: string[];
  customerId?: string | null;
  serviceIds: string[];
  barberId: string | null;
  noHaircut?: boolean;
  skinnerId: string | null;
  noSkinnerService?: boolean;
  visitId: string;
};

export type VisitDetailUpdateRequestBody = {
  comboIds?: unknown;
  serviceIds?: unknown;
  barberId?: unknown;
  noHaircut?: unknown;
  skinnerId?: unknown;
  noSkinnerService?: unknown;
};

export type VisitStatusUpdateInput = {
  customerId?: string | null;
  noHaircut?: boolean;
  noSkinnerService?: boolean;
  status: CustomerVisitStatus;
  visitId: string;
};

export type VisitStatusUpdateRequestBody = {
  noHaircut?: unknown;
  noSkinnerService?: unknown;
  status?: unknown;
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

export type VisitPhotoDeleteInput = {
  photoId: string;
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
  suggestions?: VisitCreateSuggestions | null;
};

export type VisitCreateSuggestions = {
  services: Array<{
    itemId: string | null;
    type: VisitItemTypeValue;
  }>;
  barber: {
    id: string;
  } | null;
  skinner: {
    id: string;
  } | null;
};

export type VisitDetailViewProps = {
  barbers: VisitCreateStaff[];
  backHref: string;
  combos?: VisitCreateItem[];
  error: unknown;
  isDeletingPhoto?: boolean;
  isUpdatingDetail?: boolean;
  isLoading: boolean;
  isRefreshingDetail?: boolean;
  isUpdatingStatus?: boolean;
  isUploadingPhoto: boolean;
  isUpdatingStaff: boolean;
  services?: VisitCreateItem[];
  skinners: VisitCreateStaff[];
  updateError: string;
  visit: CustomerVisit | null;
  onDeletePhoto?: (input: VisitPhotoDeleteInput) => Promise<CustomerVisitPhoto>;
  onRefreshDetail?: () => Promise<unknown>;
  onUpdateDetail?: (input: VisitDetailUpdateInput) => Promise<CustomerVisit>;
  onUploadPhoto: (input: VisitPhotoUploadInput) => Promise<CustomerVisitPhoto>;
  onUpdateError: (error: string) => void;
  onUpdateStaff: (input: VisitStaffUpdateInput) => Promise<CustomerVisit>;
  onUpdateStatus?: (input: VisitStatusUpdateInput) => Promise<CustomerVisit>;
};

export type VisitProviderProps = {
  backHref: string;
  children: ReactNode;
  returnToCustomerId?: string | null;
  visitId?: string;
};

export type VisitContextValue = VisitCreateOptions & {
  backHref: string;
  createVisit: (input: VisitCreateInput) => Promise<CustomerVisit>;
  deleteVisitPhoto: (input: VisitPhotoDeleteInput) => Promise<CustomerVisitPhoto>;
  error: unknown;
  isCreating: boolean;
  isDeletingPhoto: boolean;
  isLoading: boolean;
  isLoadingOptions: boolean;
  isRefreshingDetail: boolean;
  isUpdatingDetail: boolean;
  isUploadingPhoto: boolean;
  isUpdatingStaff: boolean;
  isUpdatingStatus: boolean;
  optionsError: unknown;
  refreshVisitDetail: () => Promise<CustomerVisit | null>;
  returnToCustomerId: string | null;
  updateVisitDetail: (input: VisitDetailUpdateInput) => Promise<CustomerVisit>;
  updateVisitStaff: (input: VisitStaffUpdateInput) => Promise<CustomerVisit>;
  updateVisitStatus: (input: VisitStatusUpdateInput) => Promise<CustomerVisit>;
  uploadVisitPhoto: (input: VisitPhotoUploadInput) => Promise<CustomerVisitPhoto>;
  visit: CustomerVisit | null;
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
  suggestions?: VisitCreateSuggestions | null;
  returnToCustomerId: string | null;
  onClearSelectedCustomer: () => void;
  onClearSearch?: () => void;
  onSearch: FormEventHandler<HTMLFormElement>;
  onSearchInputChange: ChangeEventHandler<HTMLInputElement>;
  onSelectCustomer: (customer: Customer) => void;
};

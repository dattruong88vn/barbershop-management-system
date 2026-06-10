import type {
  ChangeEventHandler,
  FormEventHandler,
} from "react";
import type { VisitStatusValue } from "@/constants/visitStatuses";

export type CustomerLastVisitService = {
  id: string;
  name: string;
  type: "service" | "combo";
  price: number;
};

export type CustomerLastVisitStaff = {
  id: string;
  username: string;
} | null;

export type CustomerLastVisitPhoto = {
  id: string;
  photoUrl: string;
  createdAt: string;
};

export type CustomerLastVisit = {
  id: string;
  createdAt: string;
  completedAt: string | null;
  services: CustomerLastVisitService[];
  barber: CustomerLastVisitStaff;
  skinner: CustomerLastVisitStaff;
  photos: CustomerLastVisitPhoto[];
} | null;

export type Customer = {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  createdAt: string;
  lastVisit: CustomerLastVisit;
};

export type CustomerFormInput = {
  name: string;
  phone: string;
};

export type CustomerRequestBody = {
  name?: unknown;
  phone?: unknown;
};

export type CustomerListApiResponse = {
  customers: Customer[];
};

export type CustomerApiResponse = {
  customer?: Customer;
  error?: string;
};

export type CustomerVisitStatus = VisitStatusValue;

export type CustomerVisitService = {
  id: string;
  itemId: string | null;
  name: string;
  type: "service" | "combo";
  price: number;
};

export type CustomerVisitStaff = {
  id: string;
  username: string;
} | null;

export type CustomerVisitPhoto = {
  id: string;
  photoUrl: string;
  createdAt: string;
};

export type CustomerVisit = {
  canUploadPhotos?: boolean;
  id: string;
  createdAt: string;
  completedAt: string | null;
  lastUpdatedBy: string | null;
  status: CustomerVisitStatus;
  totalPrice: number;
  services: CustomerVisitService[];
  barber: CustomerVisitStaff;
  skinner: CustomerVisitStaff;
  photos: CustomerVisitPhoto[];
};

export type CustomerVisitSuggestion = {
  services: CustomerVisitService[];
  barber: CustomerVisitStaff;
  skinner: CustomerVisitStaff;
};

export type CustomerVisitHistoryCustomer = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
};

export type CustomerUpdateInput = {
  id: string;
  name: string;
  phone: string;
};

export type CustomerVisitHistory = {
  customer: CustomerVisitHistoryCustomer;
  visits: CustomerVisit[];
  suggestions: CustomerVisitSuggestion | null;
};

export type CustomerVisitHistoryApiResponse = CustomerVisitHistory & {
  error?: string;
};

export type CustomerUpdateApiResponse = {
  customer?: CustomerVisitHistoryCustomer;
  error?: string;
};

export type CustomerVisitHistoryProps = {
  customerId: string;
};

export type CustomerProfileMetric = {
  desktopLabel: string;
  mobileLabel: string;
  value: string;
  mobileValue?: string;
};

export type CustomerVisitCardProps = {
  visit: CustomerVisit;
  customerId: string;
};

export type CustomerAvatarProps = {
  customer: Customer;
};

export type CustomerCardLookupProps = {
  customer: Customer;
};

export type CustomerSearchFormProps = {
  onClearSearch: () => void;
  onCreateCustomer: () => void;
  onSearch: FormEventHandler<HTMLFormElement>;
  onSearchInputChange: ChangeEventHandler<HTMLInputElement>;
  searchInput: string;
};

export type RecentCustomerSearchesProps = {
  onSelectSearch: (search: string) => void;
  searches: string[];
};

export type CustomerSearchResultsProps = {
  customers: Customer[];
  customersError: unknown;
  defaultEmptyStateText: string;
  hasNoResults: boolean;
  hasSearched: boolean;
  isLoading: boolean;
  onCreateCustomer: () => void;
};

export type CustomerMobileHeaderProps = {
  onCreateCustomer: () => void;
};

export type CreateCustomerModalProps = {
  error: string;
  isCreating: boolean;
  name: string;
  onClose: () => void;
  onNameChange: ChangeEventHandler<HTMLInputElement>;
  onPhoneChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  phone: string;
};

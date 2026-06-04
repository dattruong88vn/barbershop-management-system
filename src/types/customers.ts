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

export type CustomerVisitStatus = "pending" | "in_progress" | "completed";

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
  id: string;
  createdAt: string;
  completedAt: string | null;
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

export type CustomerVisitHistory = {
  customer: CustomerVisitHistoryCustomer;
  visits: CustomerVisit[];
  suggestions: CustomerVisitSuggestion | null;
};

export type CustomerVisitHistoryApiResponse = CustomerVisitHistory & {
  error?: string;
};

export type CustomerVisitHistoryProps = {
  customerId: string;
};

export type CustomerVisitCardProps = {
  visit: CustomerVisit;
};

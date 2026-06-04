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

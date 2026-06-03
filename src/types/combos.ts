export type ComboService = {
  id: string;
  name: string;
  price: number;
  isHaircut: boolean;
};

export type Combo = {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  services: ComboService[];
  createdAt: string;
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

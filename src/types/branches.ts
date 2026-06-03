export type Branch = {
  id: string;
  shopId: string;
  name: string;
  address: string;
  createdAt: string;
};

export type BranchFormInput = {
  name: string;
  address: string;
};

export type BranchRequestBody = {
  name?: unknown;
  address?: unknown;
};

export type BranchListApiResponse = {
  branches: Branch[];
};

export type BranchApiResponse = {
  branch?: Branch;
  error?: string;
};

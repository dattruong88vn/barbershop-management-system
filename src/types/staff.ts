export type StaffRole = "receptionist" | "barber" | "skinner";

export type StaffStatus = "active" | "inactive";

export type StaffBranch = {
  id: string;
  name: string;
};

export type Staff = {
  id: string;
  shopId: string;
  branchId: string | null;
  username: string;
  role: StaffRole;
  status: StaffStatus;
  isFirstLogin: boolean;
  createdAt: string;
  branch: StaffBranch | null;
};

export type StaffFormInput = {
  username: string;
  password?: string;
  role: StaffRole;
  branchId: string | null;
};

export type StaffRequestBody = {
  username?: unknown;
  password?: unknown;
  role?: unknown;
  branchId?: unknown;
};

export type StaffListApiResponse = {
  staff: Staff[];
};

export type StaffApiResponse = {
  staffMember?: Staff;
  error?: string;
};

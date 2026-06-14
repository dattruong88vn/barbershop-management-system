import type { ReactNode } from "react";
import type { UserRoleValue } from "@/constants/common";

export type UserRole = UserRoleValue;

export type UserStatus = "active" | "inactive";

export type AuthUserFields = {
  id: string;
  role: UserRole;
  shop_id: string | null;
  branch_id: string | null;
  username: string;
  is_first_login: boolean;
};

export type ChangePasswordRequestBody = {
  password?: unknown;
  confirmPassword?: unknown;
};

export type ChangePasswordInput = {
  password: string;
  confirmPassword: string;
};

export type ChangePasswordResult = {
  username: string;
  redirectTo: string;
};

export type ChangePasswordApiResponse = Partial<ChangePasswordResult> & {
  error?: string;
};

export type ProvidersProps = {
  children: ReactNode;
};

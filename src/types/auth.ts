import type {
  ChangeEventHandler,
  FormEventHandler,
  InputHTMLAttributes,
  ReactNode,
} from "react";

export type UserRole =
  | "superadmin"
  | "owner"
  | "manager"
  | "receptionist"
  | "barber"
  | "skinner";

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

export type AuthFormShellProps = {
  children: ReactNode;
  description: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  title: string;
};

export type PasswordFieldProps = {
  autoComplete: string;
  error?: string;
  hidePasswordLabel: string;
  label: string;
  minLength?: number;
  name: string;
  onBlur?: () => void;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  required?: boolean;
  showPasswordLabel: string;
  value: string;
};

export type InlineAlertProps = {
  children?: ReactNode;
  className?: string;
};

export type FormTextFieldProps = {
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
  error?: string;
  id: string;
  label: string;
  name?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  required?: boolean;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  value: string;
};

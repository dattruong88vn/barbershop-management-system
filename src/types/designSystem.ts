import type {
  ChangeEventHandler,
  FormEventHandler,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";

export type AuthFormShellProps = {
  children: ReactNode;
  description: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  title: string;
};

export type EmptyStateProps = {
  action?: ReactNode;
  icon: LucideIcon;
  text: string;
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

export type InlineAlertProps = {
  children?: ReactNode;
  className?: string;
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

export type SkeletonProps = {
  className?: string;
};

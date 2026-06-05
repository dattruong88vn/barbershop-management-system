import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FormTextFieldProps } from "@/types";

export function FormTextField({
  autoComplete,
  autoFocus,
  className,
  error,
  id,
  label,
  name,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: FormTextFieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-1">
        <label htmlFor={id} className="text-label-14 text-gray-900">
          {label}
        </label>
        {required ? (
          <span aria-hidden="true" className="text-red-900">
            *
          </span>
        ) : null}
      </div>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        onChange={onChange}
        className={cn(
          "h-10 border-gray-400 bg-gray-100 px-3 text-label-14 text-gray-1000 shadow-none placeholder:text-gray-700 focus-visible:border-gray-600 focus-visible:ring-gray-600/20",
          error ? "border-red-900 focus-visible:border-red-900" : null,
          className,
        )}
      />
      {error ? <p className="mt-1.5 text-copy-13 text-red-900">{error}</p> : null}
    </div>
  );
}

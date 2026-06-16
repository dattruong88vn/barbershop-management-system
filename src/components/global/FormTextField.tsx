import { Input } from "@/components/global/ui/input";
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
        <label htmlFor={id} className="text-xs font-medium text-foreground">
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
          "h-10 rounded-lg border-border bg-background px-3 text-base text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/20",
          error ? "border-red-900 focus-visible:border-red-900" : null,
          className,
        )}
      />
      {error ? <p className="mt-1.5 text-xs text-red-900">{error}</p> : null}
    </div>
  );
}

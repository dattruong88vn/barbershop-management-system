"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PasswordFieldProps } from "@/types";

export function PasswordField({
  autoComplete,
  error,
  hidePasswordLabel,
  label,
  minLength,
  name,
  onBlur,
  onChange,
  placeholder,
  required = false,
  showPasswordLabel,
  value,
}: PasswordFieldProps) {
  const inputId = useId();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const toggleLabel = isPasswordVisible ? hidePasswordLabel : showPasswordLabel;
  const Icon = isPasswordVisible ? EyeOff : Eye;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-1">
        <label htmlFor={inputId} className="text-label-14 text-gray-900">
          {label}
        </label>
        {required ? (
          <span aria-hidden="true" className="text-red-900">
            _
          </span>
        ) : null}
      </div>
      <div className="relative">
        <Input
          id={inputId}
          name={name}
          type={isPasswordVisible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          minLength={minLength}
          placeholder={placeholder}
          required={required}
          aria-invalid={Boolean(error)}
          onBlur={onBlur}
          onChange={onChange}
          className={cn(
            "h-10 border-gray-400 bg-gray-100 px-3 pr-10 text-label-14 text-gray-1000 shadow-none placeholder:text-gray-700 focus-visible:border-gray-600 focus-visible:ring-gray-600/20",
            error ? "border-red-900 focus-visible:border-red-900" : null,
          )}
        />
        <button
          type="button"
          aria-label={toggleLabel}
          onClick={() => setIsPasswordVisible((current) => !current)}
          className="absolute right-3 top-1/2 flex -translate-y-1/2 text-gray-700 transition hover:text-gray-1000"
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      </div>
      {error ? <p className="mt-1.5 text-copy-13 text-red-900">{error}</p> : null}
    </div>
  );
}

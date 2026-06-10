import * as React from "react";

import { cn } from "@/lib/utils";

const inputBaseStyles =
  "flex min-h-11 w-full rounded-md border border-gray-400 bg-gray-100 px-3 py-2 text-sm text-gray-1000 placeholder:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 disabled:cursor-not-allowed disabled:opacity-50";

export interface GeistInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const GeistInput = React.forwardRef<HTMLInputElement, GeistInputProps>(
  ({ className, error = false, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        inputBaseStyles,
        error && "border-red-900 focus-visible:ring-red-900",
        className,
      )}
      {...props}
    />
  ),
);
GeistInput.displayName = "GeistInput";

export interface GeistTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const GeistTextarea = React.forwardRef<
  HTMLTextAreaElement,
  GeistTextareaProps
>(({ className, error = false, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      inputBaseStyles,
      "min-h-24",
      error && "border-red-900 focus-visible:ring-red-900",
      className,
    )}
    {...props}
  />
));
GeistTextarea.displayName = "GeistTextarea";

export interface GeistSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const GeistSelect = React.forwardRef<HTMLSelectElement, GeistSelectProps>(
  ({ className, error = false, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        inputBaseStyles,
        error && "border-red-900 focus-visible:ring-red-900",
        className,
      )}
      {...props}
    />
  ),
);
GeistSelect.displayName = "GeistSelect";

export interface GeistCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const GeistCheckbox = React.forwardRef<
  HTMLInputElement,
  GeistCheckboxProps
>(({ className, id, label, ...props }, ref) => (
  <div className="flex items-center gap-2">
    <input
      ref={ref}
      id={id}
      type="checkbox"
      className={cn(
        "size-4 cursor-pointer rounded border border-gray-500 accent-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900",
        className,
      )}
      {...props}
    />
    {label ? (
      <label className="cursor-pointer text-sm font-medium text-gray-1000" htmlFor={id}>
        {label}
      </label>
    ) : null}
  </div>
));
GeistCheckbox.displayName = "GeistCheckbox";

export interface GeistRadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const GeistRadio = React.forwardRef<HTMLInputElement, GeistRadioProps>(
  ({ className, id, label, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <input
        ref={ref}
        id={id}
        type="radio"
        className={cn(
          "size-4 cursor-pointer accent-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900",
          className,
        )}
        {...props}
      />
      {label ? (
        <label className="cursor-pointer text-sm font-medium text-gray-1000" htmlFor={id}>
          {label}
        </label>
      ) : null}
    </div>
  ),
);
GeistRadio.displayName = "GeistRadio";

export interface GeistSwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const GeistSwitch = React.forwardRef<HTMLInputElement, GeistSwitchProps>(
  ({ className, id, label, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={cn(
          "size-5 cursor-pointer appearance-none rounded-full bg-gray-400 transition-colors checked:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900",
          className,
        )}
        {...props}
      />
      {label ? (
        <label className="cursor-pointer text-sm font-medium text-gray-1000" htmlFor={id}>
          {label}
        </label>
      ) : null}
    </div>
  ),
);
GeistSwitch.displayName = "GeistSwitch";

export interface GeistSliderProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const GeistSlider = React.forwardRef<HTMLInputElement, GeistSliderProps>(
  ({ className, id, label, max = 100, min = 0, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label ? (
        <label className="text-sm font-medium text-gray-1000" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={id}
        max={max}
        min={min}
        type="range"
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-300 accent-blue-900",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
GeistSlider.displayName = "GeistSlider";

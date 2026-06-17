import * as React from "react";
import { ChevronDown, X } from "lucide-react";

import { cn } from "@/lib/utils";

const inputBaseStyles =
  "flex min-h-11 w-full rounded-md border border-gray-400 bg-gray-100 px-3 py-2 text-base text-gray-1000 placeholder:text-gray-700 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50";
const selectBaseStyles =
  "flex min-h-11 w-full appearance-none rounded-md border border-gray-400 bg-gray-100 py-2 pl-4 pr-12 text-base text-gray-1000 placeholder:text-gray-700 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50";

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
        error && "border-red-900 focus-visible:ring-red-900/30",
        className,
      )}
      {...props}
    />
  ),
);
GeistInput.displayName = "GeistInput";

export interface GeistSearchInputProps extends GeistInputProps {
  clearLabel: string;
  onClear: () => void;
}

export const GeistSearchInput = React.forwardRef<
  HTMLInputElement,
  GeistSearchInputProps
>(({ className, clearLabel, onClear, value, ...props }, ref) => (
  <span className="relative block w-full">
    <GeistInput
      ref={ref}
      className={cn("pr-12", className)}
      value={value}
      {...props}
      type="text"
    />
    {value ? (
      <button
        aria-label={clearLabel}
        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-700 hover:bg-gray-200 hover:text-gray-1000"
        type="button"
        onClick={onClear}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    ) : null}
  </span>
));
GeistSearchInput.displayName = "GeistSearchInput";

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
      error && "border-red-900 focus-visible:ring-red-900/30",
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
  (
    {
      children,
      className,
      disabled = false,
      error = false,
      onBlur,
      onChange,
      onFocus,
      value,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const selectId = React.useId();
    const listboxId = React.useId();
    const wrapperRef = React.useRef<HTMLSpanElement>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(
      String(defaultValue ?? ""),
    );
    const options = React.Children.toArray(children).flatMap((child) => {
      if (!React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(child)) {
        return [];
      }

      const optionValue = String(child.props.value ?? child.props.children ?? "");

      return [
        {
          disabled: Boolean(child.props.disabled),
          label: child.props.children,
          value: optionValue,
        },
      ];
    });
    const fallbackValue = internalValue || options[0]?.value || "";
    const currentValue = String(value ?? fallbackValue);
    const selectedOption =
      options.find((option) => option.value === currentValue) ?? options[0];

    React.useEffect(() => {
      function handlePointerDown(event: PointerEvent) {
        if (!wrapperRef.current?.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }

      document.addEventListener("pointerdown", handlePointerDown);

      return () => {
        document.removeEventListener("pointerdown", handlePointerDown);
      };
    }, []);

    function handleSelect(nextValue: string) {
      setInternalValue(nextValue);
      setIsOpen(false);

      if (onChange) {
        onChange({
          target: { value: nextValue },
          currentTarget: { value: nextValue },
        } as React.ChangeEvent<HTMLSelectElement>);
      }
    }

    return (
      <span ref={wrapperRef} className={cn("relative block w-full", className)}>
        <select
          ref={ref}
          className="sr-only"
          disabled={disabled}
          value={currentValue}
          onBlur={onBlur}
          onChange={onChange}
          onFocus={onFocus}
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        >
          {children}
        </select>
        <button
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            selectBaseStyles,
            "items-center justify-between text-left",
            error && "border-red-900 focus-visible:ring-red-900/30",
          )}
          disabled={disabled}
          id={selectId}
          type="button"
          onClick={() => setIsOpen((nextIsOpen) => !nextIsOpen)}
        >
          <span className="truncate">{selectedOption?.label}</span>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-700"
            aria-hidden="true"
          />
        </button>
        {isOpen ? (
          <span
            aria-labelledby={selectId}
            className="absolute left-0 top-full z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-gray-400 bg-gray-100 py-1 shadow-lg"
            id={listboxId}
            role="listbox"
          >
            {options.map((option) => (
              <button
                aria-selected={option.value === currentValue}
                className={cn(
                  "flex min-h-9 w-full items-center px-4 py-2 text-left text-base text-gray-1000 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50",
                  option.value === currentValue && "bg-gray-200 font-medium",
                )}
                disabled={option.disabled}
                key={option.value}
                role="option"
                type="button"
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            ))}
          </span>
        ) : null}
      </span>
    );
  },
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
        "size-4 cursor-pointer rounded border border-gray-500 accent-blue-900 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
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
          "size-4 cursor-pointer accent-blue-900 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
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
          "size-5 cursor-pointer appearance-none rounded-full bg-gray-400 transition-colors checked:bg-blue-900 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
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

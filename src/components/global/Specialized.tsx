"use client";

import * as React from "react";
import { Check, Clipboard, Moon, Sun, X } from "lucide-react";

import { designSystemTexts } from "@/constants/texts";
import { cn } from "@/lib/utils";
import { formatRelativeTime, middleTruncate } from "./utils";

export interface GeistCodeBlockProps
  extends React.HTMLAttributes<HTMLPreElement> {
  code: string;
  copyable?: boolean;
  language?: string;
}

export const GeistCodeBlock = React.forwardRef<
  HTMLPreElement,
  GeistCodeBlockProps
>(({ className, code, copyable = true, ...props }, ref) => {
  const [copied, setCopied] = React.useState(false);

  return (
    <div className="relative">
      <pre
        ref={ref}
        className={cn(
          "overflow-auto rounded-xl bg-gray-1000 p-4 text-sm text-background-100",
          className,
        )}
        {...props}
      >
        <code>{code}</code>
      </pre>
      {copyable ? (
        <button
          className="absolute right-2 top-2 inline-flex min-h-11 items-center gap-1 rounded-md bg-gray-800 px-2 py-1 text-xs text-background-100 hover:bg-gray-700"
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? (
            <Check className="size-3" aria-hidden="true" />
          ) : (
            <Clipboard className="size-3" aria-hidden="true" />
          )}
          {copied
            ? designSystemTexts.actions.copied
            : designSystemTexts.actions.copy}
        </button>
      ) : null}
    </div>
  );
});
GeistCodeBlock.displayName = "GeistCodeBlock";

export interface GeistSnippetProps
  extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  copyable?: boolean;
  symbol?: string;
}

export const GeistSnippet = React.forwardRef<HTMLDivElement, GeistSnippetProps>(
  ({ className, code, copyable = true, symbol = "$", ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 rounded-md bg-gray-200 px-3 py-2 font-mono text-sm",
          className,
        )}
        {...props}
      >
        <span className="text-gray-700">{symbol}</span>
        <code className="flex-1 text-gray-1000">{code}</code>
        {copyable ? (
          <button
            className="min-h-11 text-gray-700 hover:text-gray-1000"
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Clipboard className="size-4" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>
    );
  },
);
GeistSnippet.displayName = "GeistSnippet";

export interface GeistCalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  maxDate?: Date;
  minDate?: Date;
  onChange?: (date: Date) => void;
  value?: Date;
}

export const GeistCalendar = React.forwardRef<
  HTMLDivElement,
  GeistCalendarProps
>(
  (
    {
      className,
      maxDate,
      minDate,
      onChange,
      value = new Date(),
      ...props
    },
    ref,
  ) => {
    const [currentDate, setCurrentDate] = React.useState(value);
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).getDate();
    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    ).getDay();
    const previousMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    const nextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1,
    );
    const canGoPrevious =
      !minDate ||
      previousMonth >=
        new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const canGoNext =
      !maxDate ||
      nextMonth <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    const monthLabel = `${String(currentDate.getMonth() + 1).padStart(2, "0")}/${currentDate.getFullYear()}`;

    React.useEffect(() => {
      setCurrentDate(value);
    }, [value]);

    return (
      <div
        ref={ref}
        className={cn("rounded-xl border border-gray-400 p-4", className)}
        {...props}
      >
        <div className="mb-3 flex items-center justify-between">
          <button
            className="min-h-9 px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canGoPrevious}
            type="button"
            onClick={() => setCurrentDate(previousMonth)}
          >
            {designSystemTexts.calendar.previous}
          </button>
          <span className="text-sm font-semibold text-gray-1000">
            {monthLabel}
          </span>
          <button
            className="min-h-9 px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canGoNext}
            type="button"
            onClick={() => setCurrentDate(nextMonth)}
          >
            {designSystemTexts.calendar.next}
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {designSystemTexts.calendar.days.map((day) => (
            <div key={day} className="font-semibold text-gray-700">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const date = index + 1;
            const isSelected =
              date === value.getDate() &&
              value.getMonth() === currentDate.getMonth() &&
              value.getFullYear() === currentDate.getFullYear();
            const candidateDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              date,
            );
            const isDisabled =
              Boolean(minDate && candidateDate < minDate) ||
              Boolean(maxDate && candidateDate > maxDate);

            return (
              <button
                key={date}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md text-sm",
                  isSelected
                    ? "bg-blue-900 text-background-100"
                    : "hover:bg-gray-200",
                  isDisabled &&
                    "cursor-not-allowed opacity-40 hover:bg-transparent",
                )}
                disabled={isDisabled}
                type="button"
                onClick={() => {
                  onChange?.(candidateDate);
                }}
              >
                {date}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
GeistCalendar.displayName = "GeistCalendar";

export interface GeistThemeSwitcherProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange"> {
  onChange?: (theme: "light" | "dark") => void;
}

export const GeistThemeSwitcher = React.forwardRef<
  HTMLButtonElement,
  GeistThemeSwitcherProps
>(({ className, onChange, ...props }, ref) => {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  return (
    <button
      ref={ref}
      className={cn(
        "rounded-xl border border-gray-400 p-2 hover:bg-gray-200",
        className,
      )}
      type="button"
      onClick={() => {
        const nextTheme = theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        onChange?.(nextTheme);
        document.documentElement.classList.toggle("dark");
      }}
      {...props}
    >
      {theme === "light" ? (
        <Moon className="size-4" aria-hidden="true" />
      ) : (
        <Sun className="size-4" aria-hidden="true" />
      )}
    </button>
  );
});
GeistThemeSwitcher.displayName = "GeistThemeSwitcher";

export interface GeistSplitButtonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  options: { label: string; onClick: () => void }[];
  primary: { label: string; onClick: () => void };
}

export const GeistSplitButton = React.forwardRef<
  HTMLDivElement,
  GeistSplitButtonProps
>(({ className, options, primary, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div
      ref={ref}
      className={cn(
        "flex overflow-hidden rounded-xl border border-gray-400",
        className,
      )}
      {...props}
    >
      <button
        className="min-h-11 flex-1 bg-blue-900 px-4 py-2 font-medium text-background-100 hover:opacity-90"
        type="button"
        onClick={primary.onClick}
      >
        {primary.label}
      </button>
      <div className="relative">
        <button
          className="min-h-11 bg-blue-900 px-3 py-2 text-background-100 hover:opacity-90"
          type="button"
          onClick={() => setOpen((currentOpen) => !currentOpen)}
        >
          v
        </button>
        {open ? (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-48 rounded-xl border border-gray-400 bg-gray-100">
            {options.map((option) => (
              <button
                key={option.label}
                className="w-full min-h-11 px-4 py-2 text-left text-sm hover:bg-gray-200"
                type="button"
                onClick={() => {
                  option.onClick();
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
});
GeistSplitButton.displayName = "GeistSplitButton";

export interface GeistMultiSelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  onChange?: (values: string[]) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  value?: string[];
}

export const GeistMultiSelect = React.forwardRef<
  HTMLDivElement,
  GeistMultiSelectProps
>(
  (
    {
      className,
      onChange,
      options,
      placeholder = designSystemTexts.form.selectItems,
      searchable = false,
      searchPlaceholder,
      value = [],
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const normalizedSearch = search.trim().toLowerCase();
    const visibleOptions = normalizedSearch
      ? options.filter((option) =>
          option.label.toLowerCase().includes(normalizedSearch),
        )
      : options;

    const handleToggleOption = (optionValue: string) => {
      const nextValue = value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue];
      onChange?.(nextValue);
    };

    return (
      <div ref={ref} className={cn("relative w-full", className)} {...props}>
        <button
          className="flex min-h-11 w-full flex-wrap gap-1 rounded-xl border border-gray-400 bg-gray-100 p-2 text-left"
          type="button"
          onClick={() => setOpen((currentOpen) => !currentOpen)}
        >
          {value.length > 0 ? (
            value.map((itemValue) => (
              <span
                key={itemValue}
                className="flex items-center gap-1 rounded-md bg-blue-900 px-2 py-1 text-sm text-background-100"
              >
                {options.find((option) => option.value === itemValue)?.label}
              </span>
            ))
          ) : (
            <span className="text-gray-700">{placeholder}</span>
          )}
        </button>
        {open ? (
          <div className="absolute inset-x-0 top-full z-50 mt-1 rounded-xl border border-gray-400 bg-gray-100">
            {searchable ? (
              <div className="border-b border-gray-400 p-2">
                <input
                  className="flex min-h-10 w-full rounded-md border border-gray-400 bg-gray-100 px-3 py-2 text-sm text-gray-1000 placeholder:text-gray-700 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                  placeholder={searchPlaceholder}
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            ) : null}
            {visibleOptions.map((option) => (
              <label
                key={option.value}
                className="flex min-h-11 cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-200"
              >
                <input
                  checked={value.includes(option.value)}
                  className="size-4 accent-blue-900"
                  type="checkbox"
                  onChange={() => handleToggleOption(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
            {visibleOptions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-700">{placeholder}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
GeistMultiSelect.displayName = "GeistMultiSelect";

export interface GeistKeyboardInputProps
  extends React.HTMLAttributes<HTMLDivElement> {
  keys: string[];
}

export const GeistKeyboardInput = React.forwardRef<
  HTMLDivElement,
  GeistKeyboardInputProps
>(({ className, keys, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
    {keys.map((key, index) => (
      <React.Fragment key={`${key}-${index}`}>
        <kbd className="rounded border border-gray-400 bg-gray-200 px-2 py-1 font-mono text-xs">
          {key}
        </kbd>
        {index < keys.length - 1 ? (
          <span className="text-xs text-gray-700">+</span>
        ) : null}
      </React.Fragment>
    ))}
  </div>
));
GeistKeyboardInput.displayName = "GeistKeyboardInput";

export interface GeistPhoneProps extends React.HTMLAttributes<HTMLDivElement> {
  clickable?: boolean;
  phone: string;
}

export const GeistPhone = React.forwardRef<HTMLDivElement, GeistPhoneProps>(
  ({ className, clickable = true, phone, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      {clickable ? (
        <a className="hover:text-blue-900" href={`tel:${phone}`}>
          {phone}
        </a>
      ) : (
        phone
      )}
    </div>
  ),
);
GeistPhone.displayName = "GeistPhone";

export interface GeistMiddleTruncateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  maxLength?: number;
  text: string;
}

export const GeistMiddleTruncate = React.forwardRef<
  HTMLDivElement,
  GeistMiddleTruncateProps
>(({ className, maxLength = 20, text, ...props }, ref) => (
  <div ref={ref} className={className} title={text} {...props}>
    {middleTruncate(text, maxLength)}
  </div>
));
GeistMiddleTruncate.displayName = "GeistMiddleTruncate";

export interface GeistRelativeTimeCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  date: Date;
  label?: string;
}

export const GeistRelativeTimeCard = React.forwardRef<
  HTMLDivElement,
  GeistRelativeTimeCardProps
>(({ className, date, label, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-gray-700", className)}
    {...props}
  >
    {label ? <p className="font-medium text-gray-1000">{label}</p> : null}
    <p>{formatRelativeTime(date)}</p>
  </div>
));
GeistRelativeTimeCard.displayName = "GeistRelativeTimeCard";

export interface GeistPillProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label: string;
  onRemove?: () => void;
}

export const GeistPill = React.forwardRef<HTMLDivElement, GeistPillProps>(
  ({ className, icon, label, onRemove, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 rounded-full bg-gray-200 px-3 py-1.5",
        className,
      )}
      {...props}
    >
      {icon}
      <span className="text-sm">{label}</span>
      {onRemove ? (
        <button
          className="min-h-11 text-gray-700 hover:text-gray-1000"
          type="button"
          onClick={onRemove}
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  ),
);
GeistPill.displayName = "GeistPill";

export interface GeistWindowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  toolbar?: React.ReactNode;
}

export const GeistWindow = React.forwardRef<HTMLDivElement, GeistWindowProps>(
  ({ children, className, title, toolbar, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden rounded-xl border border-gray-400",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2 border-b border-gray-400 bg-gray-200 px-4 py-3">
        <div className="flex gap-2" aria-hidden="true">
          <div className="size-3 rounded-full bg-red-900" />
          <div className="size-3 rounded-full bg-amber-900" />
          <div className="size-3 rounded-full bg-green-900" />
        </div>
        {title ? (
          <span className="ml-auto text-xs font-medium">{title}</span>
        ) : null}
        {toolbar ? <div className="ml-auto">{toolbar}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  ),
);
GeistWindow.displayName = "GeistWindow";

"use client";

import * as React from "react";
import { X } from "lucide-react";

import { designSystemTexts } from "@/constants/texts";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { cn } from "@/lib/utils";

type Action = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "danger";
};

export interface GeistModalProps extends React.HTMLAttributes<HTMLDivElement> {
  actions?: Action[];
  containerClassName?: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title?: string;
}

export const GeistModal = React.forwardRef<HTMLDivElement, GeistModalProps>(
  (
    {
      actions,
      children,
      className,
      containerClassName,
      description,
      onOpenChange,
      open,
      title,
      ...props
    },
    ref,
  ) => {
    useLockBodyScroll(open);

    if (!open) return null;

    return (
      <>
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50"
        />
        <div
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4",
            containerClassName,
          )}
        >
          <div
            ref={ref}
            className={cn(
              "max-h-[90dvh] overflow-y-auto rounded-xl border border-gray-400 bg-gray-100 p-6",
              className,
            )}
            onClick={(event) => event.stopPropagation()}
            {...props}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                {title ? (
                  <h2 className="text-lg font-semibold text-gray-1000">
                    {title}
                  </h2>
                ) : null}
                {description ? (
                  <p className="mt-1 text-sm text-gray-700">{description}</p>
                ) : null}
              </div>
              <button
                aria-label={designSystemTexts.actions.close}
                className="flex size-10 shrink-0 items-center justify-center rounded-md text-gray-700 hover:bg-gray-200 hover:text-gray-1000"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-4">{children}</div>
            {actions ? (
              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="min-h-11 rounded-md border border-gray-400 px-4 py-2 text-sm font-medium text-gray-1000 hover:bg-gray-200"
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  {designSystemTexts.actions.cancel}
                </button>
                {actions.map((action) => (
                  <button
                    key={action.label}
                    className={cn(
                      "min-h-11 rounded-md px-4 py-2 text-sm font-medium text-background-100 transition-colors hover:opacity-90",
                      action.variant === "danger"
                        ? "bg-red-900"
                        : "bg-blue-900",
                    )}
                    type="button"
                    onClick={() => {
                      action.onClick();
                      onOpenChange(false);
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  },
);
GeistModal.displayName = "GeistModal";

export interface GeistDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  side?: "left" | "right";
  title?: string;
}

export const GeistDrawer = React.forwardRef<HTMLDivElement, GeistDrawerProps>(
  (
    { children, className, onOpenChange, open, side = "right", title, ...props },
    ref,
  ) => {
    useLockBodyScroll(open);

    if (!open) return null;

    return (
      <>
        <button
          aria-label="Close drawer"
          className="fixed inset-0 z-40 bg-black/50"
          type="button"
          onClick={() => onOpenChange(false)}
        />
        <div
          ref={ref}
          className={cn(
            "fixed bottom-0 top-0 z-50 w-80 border-gray-400 bg-gray-100",
            side === "right" ? "right-0 border-l" : "left-0 border-r",
            className,
          )}
          {...props}
        >
          <div className="flex items-center justify-between border-b border-gray-400 p-4">
            {title ? (
              <h2 className="font-semibold text-gray-1000">{title}</h2>
            ) : null}
            <button
              className="min-h-11 px-2 text-gray-700 hover:text-gray-1000"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="h-[calc(100%-76px)] overflow-auto p-4">
            {children}
          </div>
        </div>
      </>
    );
  },
);
GeistDrawer.displayName = "GeistDrawer";

export interface GeistSheetProps extends React.HTMLAttributes<HTMLDivElement> {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title?: string;
}

export const GeistSheet = React.forwardRef<HTMLDivElement, GeistSheetProps>(
  ({ children, className, onOpenChange, open, title, ...props }, ref) => {
    useLockBodyScroll(open);

    if (!open) return null;

    return (
      <>
        <button
          aria-label="Close sheet"
          className="fixed inset-0 z-40 bg-black/50"
          type="button"
          onClick={() => onOpenChange(false)}
        />
        <div
          ref={ref}
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[80vh] rounded-t-xl border-t border-gray-400 bg-gray-100",
            className,
          )}
          {...props}
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-400 p-4">
            {title ? (
              <h2 className="font-semibold text-gray-1000">{title}</h2>
            ) : null}
            <button
              className="min-h-11 px-2 text-gray-700 hover:text-gray-1000"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="overflow-auto p-4">{children}</div>
        </div>
      </>
    );
  },
);
GeistSheet.displayName = "GeistSheet";

export interface GeistPopoverProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  trigger: React.ReactNode;
}

export const GeistPopover = React.forwardRef<
  HTMLDivElement,
  GeistPopoverProps
>(
  (
    {
      children,
      className,
      onOpenChange,
      open: controlledOpen,
      trigger,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen ?? internalOpen;
    const setOpen = onOpenChange ?? setInternalOpen;

    return (
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
        {...props}
      >
        <div onClick={() => setOpen(!open)}>{trigger}</div>
        {open ? (
          <div className="absolute z-50 mt-2 w-max rounded-xl border border-gray-400 bg-gray-100">
            <div className="p-4" onClick={() => setOpen(false)}>
              {children}
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);
GeistPopover.displayName = "GeistPopover";

export interface GeistTooltipProps
  extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
}

export const GeistTooltip = React.forwardRef<HTMLDivElement, GeistTooltipProps>(
  ({ children, className, content, side = "top", ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const [position, setPosition] = React.useState({ left: 0, top: 0 });
    const triggerRef = React.useRef<HTMLDivElement | null>(null);

    function updatePosition() {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const gap = 8;

      if (side === "right") {
        setPosition({
          left: rect.right + gap,
          top: rect.top + rect.height / 2,
        });
        return;
      }

      if (side === "bottom") {
        setPosition({
          left: rect.left + rect.width / 2,
          top: rect.bottom + gap,
        });
        return;
      }

      if (side === "left") {
        setPosition({
          left: rect.left - gap,
          top: rect.top + rect.height / 2,
        });
        return;
      }

      setPosition({
        left: rect.left + rect.width / 2,
        top: rect.top - gap,
      });
    }

    const tooltipPlacement = {
      bottom: "-translate-x-1/2",
      left: "-translate-x-full -translate-y-1/2",
      right: "-translate-y-1/2",
      top: "-translate-x-1/2 -translate-y-full",
    };

    return (
      <div
        ref={(node) => {
          triggerRef.current = node;

          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn("relative inline-block", className)}
        onFocus={() => {
          updatePosition();
          setVisible(true);
        }}
        onMouseEnter={() => {
          updatePosition();
          setVisible(true);
        }}
        onMouseMove={updatePosition}
        onBlur={() => setVisible(false)}
        onMouseLeave={() => setVisible(false)}
        {...props}
      >
        {children}
        {visible ? (
          <div
            className={cn(
              "fixed z-[100] whitespace-nowrap rounded-md bg-gray-1000 px-2 py-1 text-xs text-background-100",
              tooltipPlacement[side],
            )}
            style={{
              left: position.left,
              top: position.top,
            }}
          >
            {content}
          </div>
        ) : null}
      </div>
    );
  },
);
GeistTooltip.displayName = "GeistTooltip";

export interface GeistCommandMenuProps
  extends React.HTMLAttributes<HTMLDivElement> {
  commands: {
    icon?: React.ReactNode;
    id: string;
    label: string;
    onSelect: () => void;
  }[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  placeholder?: string;
}

export const GeistCommandMenu = React.forwardRef<
  HTMLDivElement,
  GeistCommandMenuProps
>(
  (
    {
      className,
      commands,
      onOpenChange,
      open,
      placeholder = designSystemTexts.commandMenu.placeholder,
      ...props
    },
    ref,
  ) => {
    const [search, setSearch] = React.useState("");
    useLockBodyScroll(open);

    const filteredCommands = commands.filter((command) =>
      command.label.toLowerCase().includes(search.toLowerCase()),
    );

    if (!open) return null;

    return (
      <>
        <button
          aria-label="Close command menu"
          className="fixed inset-0 z-40 bg-black/50"
          type="button"
          onClick={() => onOpenChange(false)}
        />
        <div
          ref={ref}
          className={cn(
            "fixed left-1/2 top-1/4 z-50 w-full max-w-md -translate-x-1/2 px-4",
            className,
          )}
          {...props}
        >
          <div className="rounded-xl border border-gray-400 bg-gray-100">
            <input
              className="w-full border-b border-gray-400 bg-transparent px-4 py-3 text-base outline-none"
              placeholder={placeholder}
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="max-h-64 overflow-auto">
              {filteredCommands.map((command) => (
                <button
                  key={command.id}
                  className="flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-1000 hover:bg-gray-200"
                  type="button"
                  onClick={() => {
                    command.onSelect();
                    onOpenChange(false);
                  }}
                >
                  {command.icon}
                  <span>{command.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  },
);
GeistCommandMenu.displayName = "GeistCommandMenu";

export interface GeistContextMenuProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: { icon?: React.ReactNode; label: string; onClick: () => void }[];
}

export const GeistContextMenu = React.forwardRef<
  HTMLDivElement,
  GeistContextMenuProps
>(({ children, className, items, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      onContextMenu={(event) => {
        event.preventDefault();
        setPosition({ x: event.clientX, y: event.clientY });
        setVisible(true);
      }}
      {...props}
    >
      {children}
      {visible ? (
        <>
          <button
            aria-label="Close context menu"
            className="fixed inset-0 z-40"
            type="button"
            onClick={() => setVisible(false)}
          />
          <div
            className="fixed z-50 min-w-48 rounded-xl border border-gray-400 bg-gray-100"
            style={{ top: position.y, left: position.x }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                className="flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-1000 hover:bg-gray-200"
                type="button"
                onClick={() => {
                  item.onClick();
                  setVisible(false);
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
});
GeistContextMenu.displayName = "GeistContextMenu";

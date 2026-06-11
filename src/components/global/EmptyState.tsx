import type { ReactNode } from "react";

import type { EmptyStateProps as LegacyEmptyStateProps } from "@/types";

type GeistEmptyStateProps = {
  action?: { label: string; onClick: () => void } | ReactNode;
  description?: string;
  icon?: ReactNode;
  text?: never;
  title?: string;
};

type EmptyStateComponentProps =
  | LegacyEmptyStateProps
  | GeistEmptyStateProps;

function isLegacyEmptyStateProps(
  props: EmptyStateComponentProps,
): props is LegacyEmptyStateProps {
  return "text" in props && typeof props.text === "string";
}

export function EmptyState(props: EmptyStateComponentProps) {
  if (isLegacyEmptyStateProps(props)) {
    const { action, icon: Icon, text } = props;

    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background px-4 py-12 text-center">
        <Icon className="size-9 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm text-muted-foreground">{text}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    );
  }

  const { action, description, icon, title } = props;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background px-4 py-12 text-center">
      {icon ? (
        <div className="text-gray-600" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      {title ? (
        <h3 className="mt-3 text-lg font-semibold text-gray-1000">{title}</h3>
      ) : null}
      {description ? (
        <p className="mt-2 max-w-xs text-sm text-gray-700">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-4">
          {typeof action === "object" && "label" in action ? (
            <button
              className="min-h-11 rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-background-100 hover:opacity-90"
              type="button"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ) : (
            action
          )}
        </div>
      ) : null}
    </div>
  );
}

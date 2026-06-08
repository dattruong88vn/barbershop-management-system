import type { ReactNode } from "react";

export function VisitSectionShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-background p-4 md:p-5">
      <h2 className="text-sm font-semibold text-foreground md:text-base">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

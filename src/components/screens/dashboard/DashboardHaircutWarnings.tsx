import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import {
  UI_VARIANT_WARNING,
} from "@/constants/common";

import { Badge, Heading, Paragraph } from "@/components/global";
import { ROUTES } from "@/constants/routes";
import { dashboardTexts } from "@/constants/texts";
import type { DashboardHaircutWarning } from "@/types";

export function DashboardHaircutWarnings({
  warnings,
}: {
  warnings: DashboardHaircutWarning[];
}) {
  return (
    <section className="rounded-xl border border-gray-400 bg-gray-100 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Heading level={3} size="section">
          {dashboardTexts.sections.haircutWarnings}
        </Heading>
        {warnings.length ? (
          <Badge size="sm" variant={UI_VARIANT_WARNING}>
            <AlertTriangle className="size-3" aria-hidden="true" />
            {dashboardTexts.alerts.count(warnings.length)}
          </Badge>
        ) : null}
      </div>
      {warnings.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {warnings.map((warning) => (
            <Link
              key={warning.visitId}
              className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-amber-900/30 bg-amber-100 px-3 py-2 text-amber-900 transition hover:border-amber-900"
              href={ROUTES.visitDetail(warning.visitId)}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {warning.customerName}
                </span>
                <span className="block text-xs">
                  {dashboardTexts.alerts.photoWarning}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : (
        <Paragraph tone="muted">
          {dashboardTexts.alerts.empty}
        </Paragraph>
      )}
    </section>
  );
}

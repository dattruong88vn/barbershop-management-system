import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Heading, Paragraph } from "@/components/global";
import { dashboardTexts } from "@/constants/texts";
import type { DashboardTopItem } from "@/types";

const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
  currency: "VND",
  maximumFractionDigits: 0,
  style: "currency",
});

export function DashboardTopList({
  href,
  items,
  title,
}: {
  href?: string;
  items: DashboardTopItem[];
  title: string;
}) {
  return (
    <section className="min-h-72 rounded-xl border border-gray-400 bg-gray-100 p-4">
      <div className="flex items-center justify-between gap-3">
        <Heading level={3} size="section">
          {title}
        </Heading>
        {href ? (
          <Link
            className="inline-flex shrink-0 items-center gap-1 text-label-13 font-medium text-primary hover:underline"
            href={href}
          >
            {dashboardTexts.topList.viewReport}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </div>
      {items.length ? (
        <ol className="mt-4 grid gap-3">
          {items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-gray-200 text-label-13 font-medium text-gray-1000">
                {index + 1}
              </span>
              <div className="min-w-0">
                <Paragraph className="truncate" weight="medium">
                  {item.name}
                </Paragraph>
                <Paragraph size="xs" tone="muted">
                  {dashboardTexts.topList.count(item.count)}
                </Paragraph>
              </div>
              <Paragraph className="text-right" size="xs" weight="medium">
                {VND_FORMATTER.format(item.revenue)}
              </Paragraph>
            </li>
          ))}
        </ol>
      ) : (
        <Paragraph className="mt-4" tone="muted">
          {dashboardTexts.topList.empty}
        </Paragraph>
      )}
    </section>
  );
}

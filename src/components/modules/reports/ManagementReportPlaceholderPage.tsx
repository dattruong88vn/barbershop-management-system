import { BarChart3 } from "lucide-react";

import { Card, EmptyState, Heading, Paragraph } from "@/components/global";
import { InlineAlert } from "@/components/global/InlineAlert";
import { reportTexts } from "@/constants/texts";
import type { ManagementReportKind } from "@/types";

export function ManagementReportPlaceholderPage({
  reportKind,
}: {
  reportKind: ManagementReportKind;
}) {
  const title = reportTexts.management[reportKind].title;

  return (
    <main aria-label={title}>
      <div className="min-h-screen bg-muted/30 px-6 py-8 text-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <header>
            <Heading level={1} size="page">
              {title}
            </Heading>
            <Paragraph className="mt-1" tone="muted">
              {reportTexts.manager.description}
            </Paragraph>
          </header>

          <InlineAlert className="border-amber-900/30 bg-amber-100 text-amber-900">
            {reportTexts.manager.mockNotice}
          </InlineAlert>

          <Card title={reportTexts.manager.filtersTitle}>
            <EmptyState icon={BarChart3} text={reportTexts.manager.empty} />
          </Card>

          <Card title={reportTexts.manager.tableTitle}>
            <EmptyState icon={BarChart3} text={reportTexts.manager.empty} />
          </Card>
        </div>
      </div>
    </main>
  );
}

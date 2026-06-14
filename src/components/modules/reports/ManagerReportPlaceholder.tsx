import { BarChart3 } from "lucide-react";

import { Heading, Paragraph } from "@/components/global";
import { EmptyState } from "@/components/global/EmptyState";
import { InlineAlert } from "@/components/global/InlineAlert";
import { reportTexts } from "@/constants/texts";

export function ManagerReportPlaceholder() {
  return (
    <main aria-label={reportTexts.manager.title}>
      <div className="min-h-screen bg-muted/30 px-4 py-4 text-foreground md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-5xl">
          <header className="mb-4 md:mb-6">
            <Heading level={1} size="page">{reportTexts.manager.title}</Heading>
            <Paragraph className="mt-1" tone="muted">
              {reportTexts.manager.description}
            </Paragraph>
          </header>

          <InlineAlert className="mb-4 border-amber-900/30 bg-amber-100 text-amber-900">
            {reportTexts.manager.mockNotice}
          </InlineAlert>

          <EmptyState icon={BarChart3} text={reportTexts.manager.empty} />
        </div>
      </div>
    </main>
  );
}

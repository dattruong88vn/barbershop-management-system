import { MonitorSmartphone } from "lucide-react";

import { commonTexts } from "@/constants/texts";

export function StaffDesktopFallback() {
  return (
    <main
      aria-label={commonTexts.staffDesktopFallback.title}
      className="hidden min-h-screen items-center justify-center bg-muted/30 px-6 text-foreground lg:flex"
    >
      <section className="w-full max-w-md rounded-xl border border-border bg-background p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-border bg-muted text-foreground">
          <MonitorSmartphone className="size-5" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          {commonTexts.staffDesktopFallback.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {commonTexts.staffDesktopFallback.description}
        </p>
      </section>
    </main>
  );
}

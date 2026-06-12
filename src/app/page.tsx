import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { commonTexts } from "@/constants/texts";

export default function Home() {
  const pageTitle = commonTexts.home.title;

  return (
    <main
      aria-label={pageTitle}
      className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10 text-foreground"
    >
      <section className="w-full max-w-xl rounded-xl border border-border bg-background p-6">
        <h1 className="text-heading-32 font-semibold text-gray-1000">
          {pageTitle}
        </h1>
        <p className="mt-3 text-copy-16 text-gray-700">
          {commonTexts.home.subtitle}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={ROUTES.dashboard}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-1000 px-4 text-label-14 font-medium text-background"
          >
            {commonTexts.home.primaryAction}
          </Link>
          <Link
            href={ROUTES.login}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-label-14 font-medium text-gray-1000"
          >
            {commonTexts.home.secondaryAction}
          </Link>
        </div>
      </section>
    </main>
  );
}

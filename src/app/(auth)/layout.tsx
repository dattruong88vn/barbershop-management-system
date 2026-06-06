import { Scissors } from "lucide-react";
import type { ReactNode } from "react";

import { authTexts } from "@/constants/texts";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground text-background">
            <Scissors className="size-7" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {authTexts.brand.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {authTexts.brand.tagline}
            </p>
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}

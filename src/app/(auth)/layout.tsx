import { Scissors } from "lucide-react";
import type { ReactNode } from "react";

import { authTexts } from "@/constants/texts";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-dark-200 px-4 py-10 text-text-primary">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Scissors className="mb-3 size-10 text-gold" aria-hidden="true" />
          <p className="text-xl font-medium text-text-primary">
            {authTexts.brand.name}
          </p>
        </div>

        {children}
      </div>
    </main>
  );
}

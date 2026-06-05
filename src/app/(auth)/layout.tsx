import { Scissors } from "lucide-react";
import type { ReactNode } from "react";

import { authTexts } from "@/constants/texts";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background-100 px-4 py-10 text-gray-1000">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Scissors
            className="mb-3 size-10 text-gray-1000"
            aria-hidden="true"
          />
          <p className="text-heading-24 text-gray-1000">
            {authTexts.brand.name}
          </p>
        </div>

        {children}
      </div>
    </main>
  );
}

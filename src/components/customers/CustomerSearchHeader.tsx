import { Scissors } from "lucide-react";

import { customerTexts } from "@/constants/texts";

export function CustomerMobileHeader() {
  return (
    <header className="flex h-14 items-center justify-between md:hidden">
      <div className="size-10" aria-hidden="true" />
      <h1 className="text-heading-20 text-gray-1000">
        {customerTexts.lookup.titleMobile}
      </h1>
      <div className="size-10" aria-hidden="true" />
    </header>
  );
}

export function CustomerDesktopNav() {
  return (
    <nav className="sticky top-0 z-10 -mx-6 hidden h-[52px] items-center gap-6 border-b border-gray-400 bg-background-100 px-6 md:flex">
      <div className="flex items-center gap-2 text-label-14 text-gray-1000">
        <Scissors className="size-4" aria-hidden="true" />
        BarberOS
      </div>
      <span className="text-label-14 text-gray-700">
        {customerTexts.lookup.navToday}
      </span>
      <span className="border-b-2 border-gray-1000 py-4 text-label-14 text-gray-1000">
        {customerTexts.lookup.titleDesktop}
      </span>
      <span className="text-label-14 text-gray-700">
        {customerTexts.lookup.navCreate}
      </span>
    </nav>
  );
}

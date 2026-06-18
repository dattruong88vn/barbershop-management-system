"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/global/ui/button";
import {
  UI_VARIANT_SECONDARY,
} from "@/constants/common";
import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";

export function CustomerProfileHeader({
  customerName,
  onEdit,
}: {
  customerName: string | null;
  onEdit: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:h-14 md:px-5">
      <div className="hidden min-w-0 items-center gap-4 md:flex">
        <Link
          href={ROUTES.customers}
          className="flex items-center gap-3 text-sm text-muted-foreground transition hover:text-foreground"
          aria-label={customerTexts.detail.backToLookup}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {customerTexts.lookup.title}
        </Link>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="truncate text-sm font-medium text-foreground">
          {customerName ?? customerTexts.detail.profileTitle}
        </span>
      </div>

      <Link
        href={ROUTES.customers}
        className="flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted md:hidden"
        aria-label={customerTexts.detail.backToLookup}
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
      </Link>
      <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-foreground md:hidden">
        {customerTexts.detail.profileTitle}
      </h1>

      <div className="hidden items-center gap-3 md:flex">
        <Button
          type="button"
          variant={UI_VARIANT_SECONDARY}
          size="lg"
          className="h-9 rounded-lg border-border bg-background px-4 text-sm hover:bg-muted"
          onClick={onEdit}
        >
          <Pencil className="size-4" aria-hidden="true" />
          {customerTexts.detail.edit}
        </Button>
      </div>

      <div className="ml-auto md:hidden">
        <button
          type="button"
          onClick={onEdit}
          className="flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted"
          aria-label={customerTexts.detail.editInfo}
        >
          <Pencil className="size-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

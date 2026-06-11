"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  EllipsisVertical,
  Pencil,
  Plus,
} from "lucide-react";

import { Button } from "@/components/global/ui/button";
import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import { dispatchAppToast } from "@/lib/toast";

export function CustomerProfileHeader({
  customerId,
  customerName,
  customerPhone,
  hasOpenVisit,
  isMenuOpen,
  onEdit,
  onToggleMenu,
}: {
  customerId: string;
  customerName: string | null;
  customerPhone: string | null;
  hasOpenVisit: boolean;
  isMenuOpen: boolean;
  onEdit: () => void;
  onToggleMenu: () => void;
}) {
  const createVisitRoute =
    customerName && customerPhone
      ? ROUTES.createVisitForCustomer({
          id: customerId,
          name: customerName,
          phone: customerPhone,
        })
      : ROUTES.createVisit;
  const createVisitBlockedToast = {
    description: customerTexts.detail.createVisitBlockedDescription,
    message: customerTexts.detail.createVisitBlocked,
    type: "warning" as const,
  };

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
          variant="secondary"
          size="lg"
          className="h-9 rounded-lg border-border bg-background px-4 text-sm hover:bg-muted"
          onClick={onEdit}
        >
          <Pencil className="size-4" aria-hidden="true" />
          {customerTexts.detail.edit}
        </Button>
        {hasOpenVisit ? (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="h-9 rounded-lg border-border bg-background px-4 text-sm hover:bg-muted"
            onClick={() => dispatchAppToast(createVisitBlockedToast)}
          >
            <Plus className="size-4" aria-hidden="true" />
            {customerTexts.detail.createVisit}
          </Button>
        ) : (
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="h-9 rounded-lg border-border bg-background px-4 text-sm hover:bg-muted"
          >
            <Link href={createVisitRoute}>
              <Plus className="size-4" aria-hidden="true" />
              {customerTexts.detail.createVisit}
            </Link>
          </Button>
        )}
      </div>

      <div className="relative ml-auto md:hidden">
        <button
          type="button"
          onClick={onToggleMenu}
          className="flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted"
          aria-label={customerTexts.detail.editInfo}
        >
          <EllipsisVertical className="size-5" aria-hidden="true" />
        </button>
        {isMenuOpen ? (
          <div className="absolute right-0 top-11 z-30 min-w-40 rounded-lg border border-border bg-background p-1 shadow-lg">
            <button
              type="button"
              onClick={onEdit}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
            >
              <Pencil className="size-4" aria-hidden="true" />
              {customerTexts.detail.editInfo}
            </button>
            {hasOpenVisit ? (
              <button
                type="button"
                onClick={() => {
                  onToggleMenu();
                  dispatchAppToast(createVisitBlockedToast);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
              >
                <Plus className="size-4" aria-hidden="true" />
                {customerTexts.detail.createVisit}
              </button>
            ) : (
              <Link
                href={createVisitRoute}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                <Plus className="size-4" aria-hidden="true" />
                {customerTexts.detail.createVisit}
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}

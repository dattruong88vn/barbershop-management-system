"use client";

import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

import VisitCreateForm from "@/components/customers/profile/VisitCreateForm";
import { EmptyState } from "@/components/design-system/EmptyState";
import { customerTexts, visitTexts } from "@/constants/texts";
import type { VisitCreatePageViewProps } from "@/types";
import { VisitCreateCustomerStep } from "./VisitCreateCustomerStep";

export function VisitCreatePageView(props: VisitCreatePageViewProps) {
  const { backHref, returnToCustomerId, selectedCustomer } = props;

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-4 pb-8 text-foreground md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-4 md:mb-6">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {customerTexts.detail.backToLookup}
          </Link>
          <h1 className="mt-3 text-xl font-semibold text-foreground md:text-2xl">
            {visitTexts.create.pageTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {visitTexts.create.pageDescription}
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
          <VisitCreateCustomerStep {...props} />

          <div className="min-w-0">
            {selectedCustomer ? (
              <VisitCreateForm
                customerId={selectedCustomer.id}
                returnToCustomerId={returnToCustomerId}
                suggestions={null}
              />
            ) : (
              <EmptyState icon={Users} text={visitTexts.create.emptyBeforeSearch} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

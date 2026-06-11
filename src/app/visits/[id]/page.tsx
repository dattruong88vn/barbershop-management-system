"use client";

import { use } from "react";

import { VisitDetailView } from "@/components/modules/visits/VisitDetailView";
import { ROUTES } from "@/constants/routes";
import { VisitProvider } from "@/context/VisitContext";

type VisitDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    returnToCustomerId?: string;
  }>;
};

export default function VisitDetailPage({
  params,
  searchParams,
}: VisitDetailPageProps) {
  const { id: visitId } = use(params);
  const { returnToCustomerId } = use(searchParams);
  const backHref = returnToCustomerId
    ? ROUTES.customerDetail(returnToCustomerId)
    : ROUTES.customers;

  return (
    <VisitProvider
      backHref={backHref}
      returnToCustomerId={returnToCustomerId ?? null}
      visitId={visitId}
    >
      <VisitDetailView />
    </VisitProvider>
  );
}

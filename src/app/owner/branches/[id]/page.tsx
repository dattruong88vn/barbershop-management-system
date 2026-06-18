"use client";

import { use } from "react";

import { BranchInformationScreen } from "@/components/screens/branch-management";

type OwnerBranchDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function OwnerBranchDetailPage({
  params,
}: OwnerBranchDetailPageProps) {
  const { id } = use(params);

  return <BranchInformationScreen branchId={id} mode="detail" />;
}

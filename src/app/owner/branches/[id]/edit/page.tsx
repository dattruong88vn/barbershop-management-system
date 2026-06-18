"use client";

import { use } from "react";

import { BranchInformationScreen } from "@/components/screens/branch-management";

type OwnerBranchEditPageProps = {
  params: Promise<{ id: string }>;
};

export default function OwnerBranchEditPage({
  params,
}: OwnerBranchEditPageProps) {
  const { id } = use(params);

  return <BranchInformationScreen branchId={id} mode="edit" />;
}

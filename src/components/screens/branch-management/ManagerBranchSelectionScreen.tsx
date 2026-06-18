"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, MapPin } from "lucide-react";

import {
  Button,
  Card,
  EmptyState,
  Error as FeedbackError,
  PageTitle,
  Skeleton,
} from "@/components/global";
import { BRANCH_STATUS_ACTIVE } from "@/constants/common";
import { ROUTES } from "@/constants/routes";
import { branchTexts } from "@/constants/texts";
import { useBranches } from "@/hooks/useBranches";

export function ManagerBranchSelectionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { update: updateSession } = useSession();
  const { branches, error, isLoading } = useBranches();
  const activeBranches = useMemo(
    () =>
      branches.filter(
        (branch) =>
          (branch.status ?? BRANCH_STATUS_ACTIVE) === BRANCH_STATUS_ACTIVE,
      ),
    [branches],
  );

  const selectBranch = useCallback(
    (branchId: string) => {
      void updateSession({ user: { active_branch_id: branchId } }).then(
        (updatedSession) => {
          if (updatedSession?.user.active_branch_id !== branchId) return;
          void queryClient.invalidateQueries();
          router.replace(ROUTES.dashboard);
        },
      );
    },
    [queryClient, router, updateSession],
  );

  useEffect(() => {
    if (!isLoading && activeBranches.length === 1) {
      selectBranch(activeBranches[0].id);
    }
  }, [activeBranches, isLoading, selectBranch]);

  return (
    <main className="min-h-screen bg-gray-200 px-4 py-10 text-gray-1000 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <header>
          <PageTitle>{branchTexts.ownerBranches.selectBranch.title}</PageTitle>
        </header>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton className="h-40 w-full" key={index} />
            ))}
          </div>
        ) : null}

        {error ? (
          <FeedbackError
            message={error.message ?? branchTexts.ownerBranches.errors.generic}
          />
        ) : null}

        {!isLoading && !error && activeBranches.length === 0 ? (
          <EmptyState title={branchTexts.ownerBranches.selectBranch.empty} />
        ) : null}

        {!isLoading && !error && activeBranches.length > 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeBranches.map((branch) => (
              <Card className="flex flex-col" key={branch.id} padding="lg">
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-gray-200 p-2">
                    <Building2 className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-1000">
                      {branch.name}
                    </h2>
                    <p className="mt-2 flex items-start gap-2 text-sm text-gray-700">
                      <MapPin
                        className="mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {branch.address}
                    </p>
                  </div>
                </div>
                <Button
                  className="mt-6 w-full"
                  type="button"
                  onClick={() => selectBranch(branch.id)}
                >
                  {branchTexts.ownerBranches.selectBranch.action}
                </Button>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}

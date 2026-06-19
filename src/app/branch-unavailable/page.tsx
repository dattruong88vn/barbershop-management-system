"use client";

import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Button, Card, PageTitle, Text } from "@/components/global";
import { USER_ROLE_MANAGER } from "@/constants/common";
import { ROUTES } from "@/constants/routes";
import { branchTexts } from "@/constants/texts";

export default function BranchUnavailablePage() {
  const { data: session } = useSession();

  function handleLogout() {
    void signOut({ callbackUrl: ROUTES.login });
  }

  return (
    <main className="min-h-screen bg-gray-200 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl">
        <Card padding="lg">
          <PageTitle>{branchTexts.ownerBranches.unavailable.title}</PageTitle>
          <Text className="mt-4" color="muted">
            {branchTexts.ownerBranches.unavailable.message}
          </Text>
          {session?.user.role === USER_ROLE_MANAGER ? (
            <Button
              className="mt-6"
              icon={<LogOut className="size-4" aria-hidden="true" />}
              type="button"
              onClick={handleLogout}
            >
              {branchTexts.ownerBranches.unavailable.logout}
            </Button>
          ) : null}
        </Card>
      </div>
    </main>
  );
}

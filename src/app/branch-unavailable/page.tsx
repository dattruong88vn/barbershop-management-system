import { Card, PageTitle, Text } from "@/components/global";
import { branchTexts } from "@/constants/texts";

export default function BranchUnavailablePage() {
  return (
    <main className="min-h-screen bg-gray-200 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl">
        <Card padding="lg">
          <PageTitle>{branchTexts.ownerBranches.unavailable.title}</PageTitle>
          <Text className="mt-4" color="muted">
            {branchTexts.ownerBranches.unavailable.message}
          </Text>
        </Card>
      </div>
    </main>
  );
}

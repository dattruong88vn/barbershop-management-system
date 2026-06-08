import { Suspense } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updateVisitStaff: vi.fn(),
  useVisitDetail: vi.fn(),
  useVisits: vi.fn(),
}));

vi.mock("@/hooks/useVisitDetail", () => ({
  useVisitDetail: mocks.useVisitDetail,
}));

vi.mock("@/hooks/useVisits", () => ({
  useVisits: mocks.useVisits,
}));

vi.mock("@/components/visits/VisitDetailView", () => ({
  VisitDetailView: ({ visit }: { visit: { id: string } | null }) => (
    <div data-testid="visit-detail-view">{visit?.id ?? "no-visit"}</div>
  ),
}));

import VisitDetailPage from "@/app/visits/[id]/page";

describe("VisitDetailPage", () => {
  it("should load visit detail by route id", async () => {
    mocks.useVisitDetail.mockReturnValue({
      error: null,
      isLoading: false,
      isUpdatingStaff: false,
      updateVisitStaff: mocks.updateVisitStaff,
      visit: {
        id: "visit-1",
      },
    });
    mocks.useVisits.mockReturnValue({
      barbers: [],
      skinners: [],
    });

    render(
      <Suspense fallback={null}>
        <VisitDetailPage params={Promise.resolve({ id: "visit-1" })} />
      </Suspense>,
    );

    await waitFor(() => {
      expect(mocks.useVisitDetail).toHaveBeenCalledWith("visit-1");
    });
    expect(screen.getByTestId("visit-detail-view")).toHaveTextContent("visit-1");
  });
});

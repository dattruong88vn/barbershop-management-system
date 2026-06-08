import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import { visitTexts } from "@/constants/texts";
import type { CustomerVisit, VisitDetailViewProps } from "@/types";
import { VisitDetailView } from "./VisitDetailView";

function createVisit(): CustomerVisit {
  return {
    id: "visit-1",
    createdAt: "2026-06-04T01:00:00.000Z",
    completedAt: "2026-06-04T02:00:00.000Z",
    lastUpdatedBy: null,
    status: "completed",
    totalPrice: 100000,
    barber: {
      id: "barber-1",
      username: "barber01",
    },
    skinner: null,
    photos: [],
    services: [],
  };
}

function createProps(
  overrides: Partial<VisitDetailViewProps> = {},
): VisitDetailViewProps {
  return {
    barbers: [],
    error: null,
    isLoading: false,
    isUpdatingStaff: false,
    skinners: [],
    updateError: "",
    visit: createVisit(),
    onUpdateError: vi.fn(),
    onUpdateStaff: vi.fn(),
    ...overrides,
  };
}

describe("VisitDetailView", () => {
  it("should render loading skeletons", () => {
    render(<VisitDetailView {...createProps({ isLoading: true, visit: null })} />);

    expect(
      screen.getByRole("heading", { name: visitTexts.detail.title }),
    ).toBeInTheDocument();
  });

  it("should render not found empty state", () => {
    render(<VisitDetailView {...createProps({ visit: null })} />);

    expect(screen.getByText(visitTexts.detail.errors.notFound)).toBeInTheDocument();
  });

  it("should render visit detail and back link", () => {
    render(<VisitDetailView {...createProps()} />);

    expect(
      screen.getByRole("link", { name: visitTexts.detail.backToCustomers }),
    ).toHaveAttribute("href", ROUTES.customers);
    expect(screen.getByText(visitTexts.detail.status.completed)).toBeInTheDocument();
    expect(screen.getByText("barber01")).toBeInTheDocument();
  });
});

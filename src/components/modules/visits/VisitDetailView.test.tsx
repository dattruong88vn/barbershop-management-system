import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

function createRecentCompletedVisit(): CustomerVisit {
  return {
    ...createVisit(),
    completedAt: new Date().toISOString(),
    services: [
      {
        id: "visit-service-1",
        itemId: "service-1",
        name: "Cắt tóc nam",
        price: 100000,
        type: "service",
      },
    ],
  };
}

function createProps(
  overrides: Partial<VisitDetailViewProps> = {},
): VisitDetailViewProps {
  return {
    barbers: [],
    backHref: ROUTES.customers,
    error: null,
    isUploadingPhoto: false,
    isLoading: false,
    isUpdatingStaff: false,
    onRefreshDetail: vi.fn(),
    onUpdateDetail: vi.fn(),
    onUploadPhoto: vi.fn(),
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

  it("should allow staff-only edit for a recently completed visit", async () => {
    const user = userEvent.setup();

    render(
      <VisitDetailView
        {...createProps({
          barbers: [{ id: "barber-1", username: "barber01" }],
          services: [{ id: "service-1", name: "Cắt tóc nam", price: 100000 }],
          visit: createRecentCompletedVisit(),
        })}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: visitTexts.detail.editVisit }),
    );

    expect(
      screen.getByRole("checkbox", { name: /Cắt tóc nam/ }),
    ).toBeDisabled();
    expect(
      screen.getByRole("combobox", { name: visitTexts.create.barberLabel }),
    ).toBeEnabled();
  });

  it("should hide edit action after completed staff edit window expires", () => {
    render(<VisitDetailView {...createProps()} />);

    expect(
      screen.queryByRole("button", { name: visitTexts.detail.editVisit }),
    ).toBeNull();
  });
});

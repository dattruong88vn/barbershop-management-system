import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { visitTexts } from "@/constants/texts";
import type { CustomerVisit } from "@/types";
import {
  VisitDetailMainSections,
  VisitDetailSidebar,
} from "./VisitDetailSections";

function createVisit(overrides: Partial<CustomerVisit> = {}): CustomerVisit {
  return {
    id: "visit-1",
    createdAt: "2026-06-04T01:00:00.000Z",
    completedAt: "2026-06-04T02:00:00.000Z",
    lastUpdatedBy: "user-1",
    status: "completed",
    totalPrice: 100000,
    barber: {
      id: "barber-1",
      username: "barber01",
    },
    skinner: null,
    photos: [],
    services: [
      {
        id: "visit-service-1",
        itemId: "service-1",
        name: "Cắt tóc nam",
        price: 100000,
        type: "service",
      },
    ],
    ...overrides,
  };
}

describe("VisitDetailMainSections", () => {
  it("should render visit information, service list, and photo warning", () => {
    render(
      <VisitDetailMainSections visit={createVisit()} onSelectPhoto={vi.fn()} />,
    );

    expect(screen.getByText(visitTexts.detail.photoWarning)).toBeInTheDocument();
    expect(screen.getByText("Cắt tóc nam")).toBeInTheDocument();
    expect(screen.getByText(visitTexts.detail.noPhotos)).toBeInTheDocument();
    expect(screen.getByText(/100.000/)).toBeInTheDocument();
  });

  it("should open selected photo callback", async () => {
    const user = userEvent.setup();
    const onSelectPhoto = vi.fn();
    const visit = createVisit({
      photos: [
        {
          id: "photo-1",
          createdAt: "2026-06-04T02:10:00.000Z",
          photoUrl: "https://example.com/photo.jpg",
        },
      ],
    });

    render(
      <VisitDetailMainSections
        visit={visit}
        onSelectPhoto={onSelectPhoto}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: visitTexts.detail.photosTitle }),
    );

    expect(onSelectPhoto).toHaveBeenCalledWith(visit.photos[0]);
  });
});

describe("VisitDetailSidebar", () => {
  it("should render status, staff, and locked staff edit message", () => {
    render(
      <VisitDetailSidebar
        barbers={[]}
        isStaffEditable={false}
        isUpdatingStaff={false}
        skinners={[]}
        updateError=""
        visit={createVisit()}
        onUpdateError={() => undefined}
        onUpdateStaff={vi.fn()}
      />,
    );

    expect(screen.getByText(visitTexts.detail.status.completed)).toBeInTheDocument();
    expect(screen.getByText("barber01")).toBeInTheDocument();
    expect(screen.getByText(visitTexts.staffEdit.locked)).toBeInTheDocument();
  });
});

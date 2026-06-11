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
    const visit = createVisit({
      status: "in_progress",
    });

    render(
      <VisitDetailMainSections
        visit={visit}
        onSelectPhoto={vi.fn()}
      />,
    );

    expect(screen.getByText(visitTexts.detail.photoWarning)).toBeInTheDocument();
    expect(screen.getByText(visitTexts.detail.status.inProgress)).toBeInTheDocument();
    expect(screen.queryByText(visitTexts.detail.lastUpdatedByLabel)).toBeNull();
    expect(screen.getByText("Cắt tóc nam")).toBeInTheDocument();
    expect(screen.getByText(visitTexts.detail.noPhotos)).toBeInTheDocument();
    expect(screen.getAllByText(/100.000/)).toHaveLength(2);
  });

  it("should open selected photo callback", async () => {
    const user = userEvent.setup();
    const onSelectPhoto = vi.fn();
    const visit = createVisit({
      status: "in_progress",
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
        canUploadPhotos
        visit={visit}
        onSelectPhoto={onSelectPhoto}
        onUploadPhoto={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: visitTexts.detail.uploadPhoto }),
    ).toBeInTheDocument();
    expect(screen.queryByText(visitTexts.detail.uploadPhoto)).toBeNull();

    await user.click(
      screen.getByRole("button", { name: visitTexts.detail.photosTitle }),
    );

    expect(onSelectPhoto).toHaveBeenCalledWith(visit.photos[0]);
  });

  it("should not render photo warning while visit is pending", () => {
    render(
      <VisitDetailMainSections
        visit={createVisit({ status: "pending" })}
        onSelectPhoto={vi.fn()}
      />,
    );

    expect(screen.queryByText(visitTexts.detail.photoWarning)).toBeNull();
  });
});

describe("VisitDetailSidebar", () => {
  it("should render staff without the separate staff edit panel", () => {
    render(
      <VisitDetailSidebar
        visit={createVisit()}
      />,
    );

    expect(screen.getByText(visitTexts.detail.staffTitle)).toBeInTheDocument();
    expect(screen.getByText("barber01")).toBeInTheDocument();
    expect(screen.queryByText(visitTexts.staffEdit.title)).toBeNull();
  });
});

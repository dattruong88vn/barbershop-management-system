import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { visitTexts } from "@/constants/texts";
import type { CustomerVisit } from "@/types";
import { VisitStaffEditPanel } from "./VisitStaffEditPanel";

const visit: CustomerVisit = {
  id: "visit-1",
  createdAt: "2026-06-04T01:00:00.000Z",
  completedAt: "2026-06-04T02:00:00.000Z",
  lastUpdatedBy: null,
  status: "completed",
  totalPrice: 100000,
  barber: null,
  skinner: null,
  photos: [],
  services: [],
};

describe("VisitStaffEditPanel", () => {
  it("should show locked state when staff edit is not allowed", () => {
    render(
      <VisitStaffEditPanel
        barbers={[]}
        isStaffEditable={false}
        isUpdatingStaff={false}
        skinners={[]}
        updateError=""
        visit={visit}
        onError={() => undefined}
        onUpdateStaff={vi.fn()}
      />,
    );

    expect(screen.getByText(visitTexts.staffEdit.locked)).toBeInTheDocument();
  });

  it("should submit selected staff when edit is allowed", async () => {
    const user = userEvent.setup();
    const onUpdateStaff = vi.fn().mockResolvedValue(visit);

    render(
      <VisitStaffEditPanel
        barbers={[
          {
            id: "barber-1",
            role: "barber",
            username: "barber01",
          },
        ]}
        isStaffEditable
        isUpdatingStaff={false}
        skinners={[
          {
            id: "skinner-1",
            role: "skinner",
            username: "skinner01",
          },
        ]}
        updateError=""
        visit={visit}
        onError={() => undefined}
        onUpdateStaff={onUpdateStaff}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: visitTexts.detail.editStaff }),
    );
    await user.selectOptions(
      screen.getByLabelText(visitTexts.create.barberLabel),
      "barber-1",
    );
    await user.selectOptions(
      screen.getByLabelText(visitTexts.create.skinnerLabel),
      "skinner-1",
    );
    await user.click(
      screen.getByRole("button", { name: visitTexts.staffEdit.submit }),
    );

    expect(onUpdateStaff).toHaveBeenCalledWith({
      barberId: "barber-1",
      customerId: "",
      skinnerId: "skinner-1",
      visitId: "visit-1",
    });
  });
});

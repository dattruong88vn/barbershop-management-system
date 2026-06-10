import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { visitTexts } from "@/constants/texts";
import { ROUTES } from "@/constants/routes";
import type { VisitCreateFormProps } from "@/types";

const mocks = vi.hoisted(() => ({
  createVisit: vi.fn(),
  dispatchAppToast: vi.fn(),
  routerPush: vi.fn(),
  useVisits: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.routerPush,
  }),
}));

vi.mock("@/hooks/useVisits", () => ({
  useVisits: mocks.useVisits,
}));

vi.mock("@/lib/toast", () => ({
  dispatchAppToast: mocks.dispatchAppToast,
}));

import VisitCreateForm from "./VisitCreateForm";

const suggestions: VisitCreateFormProps["suggestions"] = {
  services: [
    {
      itemId: "service-1",
      type: "service",
    },
    {
      itemId: "combo-1",
      type: "combo",
    },
  ],
  barber: {
    id: "barber-1",
  },
  skinner: {
    id: "skinner-1",
  },
};

function mockUseVisits() {
  mocks.useVisits.mockReturnValue({
    barbers: [
      {
        id: "barber-1",
        username: "barber01",
        role: "barber",
      },
    ],
    combos: [
      {
        id: "combo-1",
        name: "Combo gội đầu",
        price: 50000,
      },
    ],
    createVisit: mocks.createVisit,
    error: null,
    isCreating: false,
    isLoadingOptions: false,
    services: [
      {
        id: "service-1",
        name: "Cắt tóc nam",
        price: 100000,
      },
    ],
    skinners: [
      {
        id: "skinner-1",
        username: "skinner01",
        role: "skinner",
      },
    ],
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("VisitCreateForm", () => {
  it("should prefill combo suggestions over service suggestions and calculate total price", () => {
    mockUseVisits();

    render(
      <VisitCreateForm customerId="customer-1" suggestions={suggestions} />,
    );

    const [serviceCheckbox, comboCheckbox] = screen.getAllByRole("checkbox");

    expect(serviceCheckbox).not.toBeChecked();
    expect(comboCheckbox).toBeChecked();
    expect(screen.getByLabelText(visitTexts.create.barberLabel)).toHaveValue(
      "barber-1",
    );
    expect(screen.getByLabelText(visitTexts.create.skinnerLabel)).toHaveValue(
      "skinner-1",
    );
    expect(screen.getAllByText(/50.000/).length).toBeGreaterThan(0);
  });

  it("should submit selected combo and staff", async () => {
    const user = userEvent.setup();

    mockUseVisits();
    mocks.createVisit.mockResolvedValue({ id: "visit-1" });

    render(
      <VisitCreateForm customerId="customer-1" suggestions={suggestions} />,
    );

    await user.click(screen.getByRole("button", { name: visitTexts.create.submit }));

    expect(mocks.createVisit).toHaveBeenCalledWith({
      customerId: "customer-1",
      serviceIds: [],
      comboIds: ["combo-1"],
      barberId: "barber-1",
      skinnerId: "skinner-1",
    });
    expect(mocks.dispatchAppToast).toHaveBeenCalledWith({
      description: visitTexts.create.successDescription,
      message: visitTexts.create.success,
      type: "success",
    });
    expect(mocks.routerPush).toHaveBeenCalledWith(ROUTES.visitDetail("visit-1"));
  });

  it("should uncheck combos when a service is selected", async () => {
    const user = userEvent.setup();

    mockUseVisits();

    render(
      <VisitCreateForm customerId="customer-1" suggestions={suggestions} />,
    );

    const [serviceCheckbox, comboCheckbox] = screen.getAllByRole("checkbox");

    await user.click(serviceCheckbox);

    expect(serviceCheckbox).toBeChecked();
    expect(comboCheckbox).not.toBeChecked();
    expect(screen.getAllByText(/100.000/)).toHaveLength(2);
  });

  it("should show error when submitted without selected items", async () => {
    const user = userEvent.setup();

    mockUseVisits();

    render(<VisitCreateForm customerId="customer-1" suggestions={null} />);

    await user.click(screen.getByRole("button", { name: visitTexts.create.submit }));

    expect(
      screen.getByText(visitTexts.create.errors.missingItems),
    ).toBeInTheDocument();
    expect(mocks.createVisit).not.toHaveBeenCalled();
  });
});

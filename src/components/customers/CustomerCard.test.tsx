import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CustomerCard } from "@/components/customers/CustomerCard";
import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import type { Customer } from "@/types";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

const customer: Customer = {
  id: "customer-1",
  shopId: "shop-1",
  name: "Nguyễn Văn Nam",
  phone: "0901234567",
  createdAt: "2026-06-03T01:00:00.000Z",
  lastVisit: {
    id: "visit-1",
    createdAt: new Date().toISOString(),
    completedAt: "2026-06-03T03:00:00.000Z",
    barber: null,
    skinner: null,
    photos: [],
    services: [
      {
        id: "visit-service-1",
        name: "Cắt tóc nam",
        type: "service",
        price: 80000,
      },
    ],
  },
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("CustomerCard", () => {
  it("should render customer summary and photo warning", () => {
    render(<CustomerCard customer={customer} />);

    expect(screen.getByText(customer.name)).toBeInTheDocument();
    expect(screen.getByText(customer.phone)).toBeInTheDocument();
    expect(screen.getByText(customerTexts.lookup.noPhotoWarning)).toBeInTheDocument();
  });

  it("should navigate to customer detail when clicked", async () => {
    const user = userEvent.setup();

    render(<CustomerCard customer={customer} />);

    await user.click(screen.getByRole("button", { name: /Nguyễn Văn Nam/i }));

    expect(mocks.push).toHaveBeenCalledWith(ROUTES.customerDetail(customer.id));
  });
});

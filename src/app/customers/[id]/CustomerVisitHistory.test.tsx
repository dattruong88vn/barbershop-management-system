import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import type { CustomerVisit, CustomerVisitHistoryCustomer } from "@/types";

const mocks = vi.hoisted(() => ({
  useCustomerVisits: vi.fn(),
  VisitCreateForm: vi.fn(({ customerId }: { customerId: string }) => (
    <div>{`visit-form-${customerId}`}</div>
  )),
}));

vi.mock("@/hooks/useCustomerVisits", () => ({
  useCustomerVisits: mocks.useCustomerVisits,
}));

vi.mock("@/app/customers/[id]/VisitCreateForm", () => ({
  default: mocks.VisitCreateForm,
}));

import CustomerVisitHistory from "@/app/customers/[id]/CustomerVisitHistory";

const customer: CustomerVisitHistoryCustomer = {
  id: "customer-1",
  name: "Nguyễn Văn Nam",
  phone: "0901234567",
  createdAt: "2026-06-01T01:00:00.000Z",
};

const visit: CustomerVisit = {
  id: "visit-1",
  createdAt: "2026-06-03T02:00:00.000Z",
  completedAt: "2026-06-03T03:00:00.000Z",
  status: "completed",
  totalPrice: 150000,
  barber: {
    id: "barber-1",
    username: "barber01",
  },
  skinner: {
    id: "skinner-1",
    username: "skinner01",
  },
  photos: [
    {
      id: "photo-1",
      photoUrl: "https://example.com/photo.jpg",
      createdAt: "2026-06-03T03:10:00.000Z",
    },
  ],
  services: [
    {
      id: "visit-service-1",
      itemId: "service-1",
      name: "Cắt tóc nam",
      type: "service",
      price: 100000,
    },
    {
      id: "visit-service-2",
      itemId: "combo-1",
      name: "Combo gội đầu",
      type: "combo",
      price: 50000,
    },
  ],
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("CustomerVisitHistory", () => {
  it("should render customer info, visit history, photos, and suggestions", () => {
    mocks.useCustomerVisits.mockReturnValue({
      customer,
      error: null,
      isLoading: false,
      suggestions: {
        services: visit.services,
        barber: visit.barber,
        skinner: visit.skinner,
      },
      visits: [visit],
    });

    render(<CustomerVisitHistory customerId={customer.id} />);

    expect(screen.getByText(customer.name)).toBeInTheDocument();
    expect(screen.getByText(customer.phone)).toBeInTheDocument();
    expect(screen.getAllByText("Cắt tóc nam, Combo gội đầu")).toHaveLength(2);
    expect(screen.getAllByText("barber01")).toHaveLength(2);
    expect(screen.getAllByText("skinner01")).toHaveLength(2);
    expect(screen.getByText(`visit-form-${customer.id}`)).toBeInTheDocument();
    expect(mocks.VisitCreateForm).toHaveBeenCalledWith(
      {
        customerId: customer.id,
        suggestions: {
          services: visit.services,
          barber: visit.barber,
          skinner: visit.skinner,
        },
      },
      undefined,
    );
    expect(screen.getByText(/150.000/)).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: customerTexts.detail.photosLabel,
      }),
    ).toHaveAttribute("src", "https://example.com/photo.jpg");
    expect(
      screen.getByRole("link", {
        name: customerTexts.detail.backToLookup,
      }),
    ).toHaveAttribute("href", ROUTES.customers);
  });

  it("should render empty states when customer has no visits", () => {
    mocks.useCustomerVisits.mockReturnValue({
      customer,
      error: null,
      isLoading: false,
      suggestions: null,
      visits: [],
    });

    render(<CustomerVisitHistory customerId={customer.id} />);

    expect(
      screen.getByText(customerTexts.detail.emptySuggestions),
    ).toBeInTheDocument();
    expect(screen.getByText(customerTexts.detail.emptyVisits)).toBeInTheDocument();
  });

  it("should render loading and error states", () => {
    mocks.useCustomerVisits.mockReturnValue({
      customer: null,
      error: new Error("Không tải được lịch sử"),
      isLoading: true,
      suggestions: null,
      visits: [],
    });

    render(<CustomerVisitHistory customerId={customer.id} />);

    expect(screen.getAllByText(customerTexts.detail.loading).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("Không tải được lịch sử")).toBeInTheDocument();
  });
});

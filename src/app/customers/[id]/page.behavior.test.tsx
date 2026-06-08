import { Suspense } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import type { CustomerVisit, CustomerVisitHistoryCustomer } from "@/types";

const mocks = vi.hoisted(() => ({
  useCustomerVisits: vi.fn(),
  updateCustomer: vi.fn(),
}));

vi.mock("@/hooks/useCustomerVisits", () => ({
  useCustomerVisits: mocks.useCustomerVisits,
}));

import CustomerDetailPage from "@/app/customers/[id]/page";

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
  lastUpdatedBy: null,
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

describe("CustomerDetailPage behavior", () => {
  beforeEach(() => {
    mocks.updateCustomer.mockResolvedValue(customer);
  });

  function renderCustomerDetailPage(customerId: string) {
    return render(
      <Suspense fallback={null}>
        <CustomerDetailPage params={Promise.resolve({ id: customerId })} />
      </Suspense>,
    );
  }

  it("should render customer info, visit history, photos, and suggestions", () => {
    mocks.useCustomerVisits.mockReturnValue({
      customer,
      error: null,
      isLoading: false,
      isUpdatingCustomer: false,
      suggestions: {
        services: visit.services,
        barber: visit.barber,
        skinner: visit.skinner,
      },
      updateCustomer: mocks.updateCustomer,
      visits: [visit],
    });

    renderCustomerDetailPage(customer.id);

    expect(screen.getAllByText(customer.name).length).toBeGreaterThan(0);
    expect(screen.getByText(customer.phone)).toBeInTheDocument();
    expect(screen.getAllByText("Cắt tóc nam + Combo gội đầu")).toHaveLength(2);
    expect(screen.getByText("Barber: barber01")).toBeInTheDocument();
    expect(screen.getByText("Skinner: skinner01")).toBeInTheDocument();
    expect(screen.getByText(/150.000/)).toBeInTheDocument();
    expect(
      screen.getByText(customerTexts.detail.statusCompleted),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: customerTexts.detail.photosLabel,
      }),
    ).toHaveAttribute("src", "https://example.com/photo.jpg");
    expect(
      screen.getAllByRole("link", {
        name: customerTexts.detail.backToLookup,
      })[0],
    ).toHaveAttribute("href", ROUTES.customers);
    expect(
      screen.getByRole("link", { name: customerTexts.detail.createVisit }),
    ).toHaveAttribute("href", ROUTES.createVisitForCustomer(customer));
  });

  it("should render empty states when customer has no visits", () => {
    mocks.useCustomerVisits.mockReturnValue({
      customer,
      error: null,
      isLoading: false,
      isUpdatingCustomer: false,
      suggestions: null,
      updateCustomer: mocks.updateCustomer,
      visits: [],
    });

    renderCustomerDetailPage(customer.id);

    expect(
      screen.queryByText(customerTexts.detail.emptySuggestions),
    ).not.toBeInTheDocument();
    expect(screen.getByText(customerTexts.detail.emptyVisits)).toBeInTheDocument();
    expect(screen.getByText(customerTexts.detail.noPhotos)).toBeInTheDocument();
  });

  it("should render loading and error states", () => {
    mocks.useCustomerVisits.mockReturnValue({
      customer: null,
      error: new Error("Không tải được lịch sử"),
      isLoading: true,
      isUpdatingCustomer: false,
      suggestions: null,
      updateCustomer: mocks.updateCustomer,
      visits: [],
    });

    renderCustomerDetailPage(customer.id);

    expect(screen.getAllByText(customerTexts.detail.loading).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("Không tải được lịch sử")).toBeInTheDocument();
  });

  it("should update customer info from the edit modal", async () => {
    const user = userEvent.setup();
    const updatedCustomer = {
      ...customer,
      name: "Nguyễn Văn An",
      phone: "0912345678",
    };
    mocks.updateCustomer.mockResolvedValue(updatedCustomer);
    mocks.useCustomerVisits.mockReturnValue({
      customer,
      error: null,
      isLoading: false,
      isUpdatingCustomer: false,
      suggestions: null,
      updateCustomer: mocks.updateCustomer,
      visits: [visit],
    });

    renderCustomerDetailPage(customer.id);

    await user.click(
      screen.getByRole("button", { name: customerTexts.detail.edit }),
    );
    await user.clear(screen.getByLabelText(customerTexts.lookup.nameLabel));
    await user.type(
      screen.getByLabelText(customerTexts.lookup.nameLabel),
      updatedCustomer.name,
    );
    await user.clear(screen.getByLabelText(customerTexts.lookup.phoneLabel));
    await user.type(
      screen.getByLabelText(customerTexts.lookup.phoneLabel),
      updatedCustomer.phone,
    );
    await user.click(
      screen.getByRole("button", { name: customerTexts.detail.submitUpdate }),
    );

    await waitFor(() => {
      expect(mocks.updateCustomer).toHaveBeenCalledWith({
        id: customer.id,
        name: updatedCustomer.name,
        phone: updatedCustomer.phone,
      });
    });
  });

  it("should validate customer update form", async () => {
    const user = userEvent.setup();
    mocks.useCustomerVisits.mockReturnValue({
      customer,
      error: null,
      isLoading: false,
      isUpdatingCustomer: false,
      suggestions: null,
      updateCustomer: mocks.updateCustomer,
      visits: [visit],
    });

    renderCustomerDetailPage(customer.id);

    await user.click(
      screen.getByRole("button", { name: customerTexts.detail.edit }),
    );
    await user.clear(screen.getByLabelText(customerTexts.lookup.phoneLabel));
    await user.type(screen.getByLabelText(customerTexts.lookup.phoneLabel), "123");
    await user.click(
      screen.getByRole("button", { name: customerTexts.detail.submitUpdate }),
    );

    expect(
      screen.getByText(customerTexts.detail.errors.invalidPhone),
    ).toBeInTheDocument();
    expect(mocks.updateCustomer).not.toHaveBeenCalled();
  });
});

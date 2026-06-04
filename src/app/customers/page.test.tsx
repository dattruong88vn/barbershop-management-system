import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { customerTexts } from "@/constants/texts";
import type { Customer } from "@/types";

const mocks = vi.hoisted(() => ({
  createCustomer: vi.fn(),
  useCustomers: vi.fn(),
}));

vi.mock("@/hooks/useCustomers", () => ({
  useCustomers: mocks.useCustomers,
}));

import CustomersPage from "@/app/customers/page";

const customer: Customer = {
  id: "customer-1",
  shopId: "shop-1",
  name: "Nguyễn Văn Nam",
  phone: "0901234567",
  createdAt: "2026-06-03T01:00:00.000Z",
  lastVisit: {
    id: "visit-1",
    createdAt: "2026-06-03T02:00:00.000Z",
    completedAt: "2026-06-03T03:00:00.000Z",
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
        name: "Cắt tóc nam",
        type: "service",
        price: 80000,
      },
    ],
  },
};

function mockCustomerHook(customers: Customer[] = []) {
  mocks.useCustomers.mockReturnValue({
    customers,
    createCustomer: mocks.createCustomer,
    error: null,
    isCreating: false,
    isLoading: false,
  });
}

function submitFormByButton(buttonName: string) {
  const submitButton = screen.getByRole("button", {
    name: buttonName,
  });
  const form = submitButton.closest("form");

  expect(form).not.toBeNull();
  fireEvent.submit(form as HTMLFormElement);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("CustomersPage", () => {
  it("should render empty state before searching", () => {
    mockCustomerHook();

    render(<CustomersPage />);

    expect(
      screen.getByRole("heading", {
        name: customerTexts.lookup.title,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(customerTexts.lookup.emptyBeforeSearch),
    ).toBeInTheDocument();
  });

  it("should pass submitted search term to customer hook", async () => {
    const user = userEvent.setup();
    mockCustomerHook();

    render(<CustomersPage />);

    await user.type(
      screen.getByLabelText(customerTexts.lookup.searchLabel),
      "Nam",
    );
    submitFormByButton(customerTexts.lookup.searchButton);

    await waitFor(() => {
      expect(mocks.useCustomers).toHaveBeenLastCalledWith("Nam");
    });
  });

  it("should render customer info with last visit details and photos", async () => {
    const user = userEvent.setup();

    mocks.useCustomers.mockImplementation((searchTerm: string) => ({
      customers: searchTerm ? [customer] : [],
      createCustomer: mocks.createCustomer,
      error: null,
      isCreating: false,
      isLoading: false,
    }));

    render(<CustomersPage />);

    await user.type(
      screen.getByLabelText(customerTexts.lookup.searchLabel),
      "Nam",
    );
    submitFormByButton(customerTexts.lookup.searchButton);

    expect(await screen.findByText(customer.name)).toBeInTheDocument();
    expect(screen.getByText(customer.phone)).toBeInTheDocument();
    expect(screen.getByText("Cắt tóc nam")).toBeInTheDocument();
    expect(screen.getByText("barber01")).toBeInTheDocument();
    expect(screen.getByText("skinner01")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: customerTexts.lookup.photosLabel,
      }),
    ).toHaveAttribute("src", "https://example.com/photo.jpg");
  });

  it("should show create customer form when search has no results", async () => {
    const user = userEvent.setup();
    mockCustomerHook();
    mocks.createCustomer.mockResolvedValue({
      ...customer,
      lastVisit: null,
    });

    render(<CustomersPage />);

    await user.type(
      screen.getByLabelText(customerTexts.lookup.searchLabel),
      customer.phone,
    );
    submitFormByButton(customerTexts.lookup.searchButton);
    await user.click(
      screen.getByRole("button", {
        name: customerTexts.lookup.createOption,
      }),
    );
    await user.type(
      screen.getByLabelText(customerTexts.lookup.nameLabel),
      customer.name,
    );
    submitFormByButton(customerTexts.lookup.submitCreate);

    await waitFor(() => {
      expect(mocks.createCustomer).toHaveBeenCalledWith({
        name: customer.name,
        phone: customer.phone,
      });
    });
  });
});

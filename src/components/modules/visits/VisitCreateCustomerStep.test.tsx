import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { visitTexts } from "@/constants/texts";
import { ROUTES } from "@/constants/routes";
import type { Customer, VisitCreatePageViewProps } from "@/types";
import { VisitCreateCustomerStep } from "./VisitCreateCustomerStep";

const customer: Customer = {
  id: "customer-1",
  shopId: "shop-1",
  name: "Nguyễn Văn Nam",
  phone: "0901234567",
  createdAt: "2026-06-03T01:00:00.000Z",
  lastVisit: null,
};

function createProps(
  overrides: Partial<VisitCreatePageViewProps> = {},
): VisitCreatePageViewProps {
  return {
    activeSearch: "",
    backHref: ROUTES.customers,
    customers: [],
    customersError: null,
    isLoadingCustomers: false,
    searchInput: "",
    selectedCustomer: null,
    returnToCustomerId: null,
    onClearSelectedCustomer: vi.fn(),
    onSearch: vi.fn(),
    onSearchInputChange: vi.fn(),
    onSelectCustomer: vi.fn(),
    ...overrides,
  };
}

describe("VisitCreateCustomerStep", () => {
  it("should render selected customer and clear action", async () => {
    const user = userEvent.setup();
    const onClearSelectedCustomer = vi.fn();

    render(
      <VisitCreateCustomerStep
        {...createProps({
          selectedCustomer: customer,
          onClearSelectedCustomer,
        })}
      />,
    );

    expect(screen.getByText(customer.name)).toBeInTheDocument();
    expect(screen.getByText(customer.phone)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: visitTexts.create.changeCustomer }),
    );

    expect(onClearSelectedCustomer).toHaveBeenCalled();
  });

  it("should render customer results and select a customer", async () => {
    const user = userEvent.setup();
    const onSelectCustomer = vi.fn();

    render(
      <VisitCreateCustomerStep
        {...createProps({
          activeSearch: "Nam",
          customers: [customer],
          onSelectCustomer,
        })}
      />,
    );

    expect(
      screen.getByText(visitTexts.create.customerResultsLabel(1)),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: new RegExp(customer.name) }),
    );

    expect(onSelectCustomer).toHaveBeenCalledWith(customer);
  });

  it("should render no-result empty state", () => {
    render(
      <VisitCreateCustomerStep
        {...createProps({
          activeSearch: "Không có",
        })}
      />,
    );

    expect(screen.getByText(visitTexts.create.emptyAfterSearch)).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { customerTexts, visitTexts } from "@/constants/texts";
import { ROUTES } from "@/constants/routes";
import type { Customer, VisitCreatePageViewProps } from "@/types";

vi.mock("@/components/modules/customers/profile/VisitCreateForm", () => ({
  default: ({ customerId }: { customerId: string }) => (
    <div data-testid="visit-create-form">{customerId}</div>
  ),
}));

import { VisitCreatePageView } from "./VisitCreatePageView";

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
    returnToCustomerId: null,
    searchInput: "",
    selectedCustomer: null,
    onClearSelectedCustomer: vi.fn(),
    onSearch: vi.fn(),
    onSearchInputChange: vi.fn(),
    onSelectCustomer: vi.fn(),
    ...overrides,
  };
}

describe("VisitCreatePageView", () => {
  it("should render page header and empty form state before customer selection", () => {
    render(<VisitCreatePageView {...createProps()} />);

    expect(
      screen.getByRole("link", { name: customerTexts.detail.backToLookup }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: visitTexts.create.pageTitle }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("visit-create-form")).toBeNull();
  });

  it("should render visit create form after customer selection", () => {
    render(
      <VisitCreatePageView
        {...createProps({
          selectedCustomer: customer,
        })}
      />,
    );

    expect(screen.getByTestId("visit-create-form")).toHaveTextContent(
      customer.id,
    );
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CustomerSearchResults } from "@/components/customers/CustomerSearchResults";
import { customerTexts } from "@/constants/texts";
import type { Customer } from "@/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const customer: Customer = {
  id: "customer-1",
  shopId: "shop-1",
  name: "Nguyễn Văn Nam",
  phone: "0901234567",
  createdAt: "2026-06-03T01:00:00.000Z",
  lastVisit: null,
};

describe("CustomerSearchResults", () => {
  it("should render the default empty state before searching", () => {
    render(
      <CustomerSearchResults
        customers={[]}
        customersError={null}
        defaultEmptyStateText={customerTexts.lookup.emptyBeforeSearch}
        hasNoResults={false}
        hasSearched={false}
        isLoading={false}
        onCreateCustomer={() => undefined}
      />,
    );

    expect(
      screen.getByText(customerTexts.lookup.emptyBeforeSearch),
    ).toBeInTheDocument();
  });

  it("should render error state", () => {
    render(
      <CustomerSearchResults
        customers={[]}
        customersError={new Error("Không thể tải khách hàng")}
        defaultEmptyStateText=""
        hasNoResults={false}
        hasSearched
        isLoading={false}
        onCreateCustomer={() => undefined}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Không thể tải khách hàng",
    );
  });

  it("should render results and count", () => {
    render(
      <CustomerSearchResults
        customers={[customer]}
        customersError={null}
        defaultEmptyStateText=""
        hasNoResults={false}
        hasSearched
        isLoading={false}
        onCreateCustomer={() => undefined}
      />,
    );

    expect(
      screen.getByText(customerTexts.lookup.resultsLabel(1)),
    ).toBeInTheDocument();
    expect(screen.getByText(customer.name)).toBeInTheDocument();
  });
});

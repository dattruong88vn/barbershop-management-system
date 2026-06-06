import { Suspense } from "react";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useCustomerVisits: vi.fn(),
}));

vi.mock("@/hooks/useCustomerVisits", () => ({
  useCustomerVisits: mocks.useCustomerVisits,
}));

import CustomerDetailPage from "@/app/customers/[id]/page";

describe("CustomerDetailPage", () => {
  it("should load customer visit history for route customer id", async () => {
    const customerId = "customer-1";
    mocks.useCustomerVisits.mockReturnValue({
      customer: null,
      error: null,
      isLoading: false,
      isUpdatingCustomer: false,
      suggestions: null,
      updateCustomer: vi.fn(),
      visits: [],
    });

    render(
      <Suspense fallback={null}>
        <CustomerDetailPage params={Promise.resolve({ id: customerId })} />
      </Suspense>,
    );

    await waitFor(() => {
      expect(mocks.useCustomerVisits).toHaveBeenCalledWith(customerId);
    });
  });
});

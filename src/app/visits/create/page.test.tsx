import { Suspense } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Customer } from "@/types";

const mocks = vi.hoisted(() => ({
  useCustomers: vi.fn(),
}));

vi.mock("@/hooks/useCustomers", () => ({
  useCustomers: mocks.useCustomers,
}));

vi.mock("@/components/modules/visits/VisitCreatePageView", () => ({
  VisitCreatePageView: ({
    selectedCustomer,
  }: {
    selectedCustomer: Customer | null;
  }) => (
    <div data-testid="visit-create-page-view">
      {selectedCustomer?.id ?? "no-customer"}
    </div>
  ),
}));

import VisitCreatePage from "@/app/visits/create/page";

describe("VisitCreatePage", () => {
  it("should preselect customer from search params", async () => {
    mocks.useCustomers.mockReturnValue({
      customers: [],
      error: null,
      isLoading: false,
    });

    await act(async () => {
      render(
        <Suspense fallback={null}>
          <VisitCreatePage
            searchParams={Promise.resolve({
              customerId: "customer-1",
              name: "Nguyễn Văn Nam",
              phone: "0901234567",
            })}
          />
        </Suspense>,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("visit-create-page-view")).toHaveTextContent(
        "customer-1",
      );
    });
  });

  it("should render without selected customer when params are missing", async () => {
    mocks.useCustomers.mockReturnValue({
      customers: [],
      error: null,
      isLoading: false,
    });

    await act(async () => {
      render(
        <Suspense fallback={null}>
          <VisitCreatePage searchParams={Promise.resolve({})} />
        </Suspense>,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("visit-create-page-view")).toHaveTextContent(
        "no-customer",
      );
    });
  });
});

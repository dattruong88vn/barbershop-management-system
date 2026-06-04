import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  CustomerVisitHistory: vi.fn(
    ({ customerId }: { customerId: string }) => (
      <div>{`customer-history-${customerId}`}</div>
    ),
  ),
}));

vi.mock("@/app/customers/[id]/CustomerVisitHistory", () => ({
  default: mocks.CustomerVisitHistory,
}));

import CustomerDetailPage from "@/app/customers/[id]/page";

describe("CustomerDetailPage", () => {
  it("should render customer visit history for route customer id", async () => {
    const customerId = "customer-1";
    const page = await CustomerDetailPage({
      params: Promise.resolve({ id: customerId }),
    });

    render(page);

    expect(screen.getByText("customer-history-customer-1")).toBeInTheDocument();
    expect(mocks.CustomerVisitHistory).toHaveBeenCalledWith(
      { customerId },
      undefined,
    );
  });
});

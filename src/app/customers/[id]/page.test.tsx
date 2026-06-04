import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";

import CustomerDetailPage from "@/app/customers/[id]/page";

describe("CustomerDetailPage", () => {
  it("should render customer id and link back to lookup page", async () => {
    const customerId = "customer-1";
    const page = await CustomerDetailPage({
      params: Promise.resolve({ id: customerId }),
    });

    render(page);

    expect(
      screen.getByRole("heading", {
        name: customerTexts.detail.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(customerId)).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: customerTexts.detail.backToLookup,
      }),
    ).toHaveAttribute("href", ROUTES.customers);
  });
});

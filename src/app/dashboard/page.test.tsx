import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardPage from "@/app/dashboard/page";
import { dashboardTexts } from "@/constants/texts";

describe("DashboardPage", () => {
  it("should render the dashboard heading", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: dashboardTexts.title,
      }),
    ).toBeInTheDocument();
  });
});

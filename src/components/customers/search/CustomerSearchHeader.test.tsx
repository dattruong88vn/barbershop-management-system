import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { customerTexts } from "@/constants/texts";
import { CustomerDesktopNav } from "./CustomerSearchHeader";

describe("CustomerDesktopNav", () => {
  it("should link sidebar items to app routes", () => {
    render(<CustomerDesktopNav />);

    expect(
      screen.getByRole("link", { name: customerTexts.lookup.navToday }),
    ).toHaveAttribute("href", ROUTES.visits);
    expect(
      screen.getByRole("link", { name: customerTexts.lookup.titleDesktop }),
    ).toHaveAttribute("href", ROUTES.customers);
    expect(
      screen.getByRole("link", { name: customerTexts.lookup.navCreate }),
    ).toHaveAttribute("href", ROUTES.createVisit);
    expect(
      screen.getByRole("link", { name: customerTexts.lookup.navReports }),
    ).toHaveAttribute("href", ROUTES.reports);
  });

  it("should mark the customer search item as active", () => {
    render(<CustomerDesktopNav />);

    expect(
      screen.getByRole("link", { name: customerTexts.lookup.titleDesktop }),
    ).toHaveAttribute("aria-current", "page");
  });
});

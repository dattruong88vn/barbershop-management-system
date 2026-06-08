import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { commonTexts } from "@/constants/texts";
import { AppMobileBottomNav } from "./AppMobileBottomNav";

describe("AppMobileBottomNav", () => {
  it("should link bottom nav items to app routes", () => {
    render(<AppMobileBottomNav activeItem="search" />);

    expect(
      screen.getByRole("link", { name: commonTexts.navigation.today }),
    ).toHaveAttribute("href", ROUTES.visits);
    expect(
      screen.getByRole("link", { name: commonTexts.navigation.search }),
    ).toHaveAttribute("href", ROUTES.customers);
    expect(
      screen.getByRole("link", { name: commonTexts.navigation.create }),
    ).toHaveAttribute("href", ROUTES.createVisit);
    expect(
      screen.getByRole("link", { name: commonTexts.navigation.reports }),
    ).toHaveAttribute("href", ROUTES.reports);
  });

  it("should mark the active bottom nav item", () => {
    render(<AppMobileBottomNav activeItem="create" />);

    expect(
      screen.getByRole("link", { name: commonTexts.navigation.create }),
    ).toHaveAttribute("aria-current", "page");
  });
});

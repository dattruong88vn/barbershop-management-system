import { Search } from "lucide-react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MobileBottomNavigation } from "./MobileBottomNavigation";

describe("MobileBottomNavigation", () => {
  it("should render href items as links", () => {
    render(
      <MobileBottomNavigation
        items={[
          {
            href: "/customers",
            icon: Search,
            isActive: true,
            label: "Tìm",
          },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Tìm" })).toHaveAttribute(
      "href",
      "/customers",
    );
    expect(screen.getByRole("link", { name: "Tìm" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("should render callback items as buttons", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <MobileBottomNavigation
        items={[
          {
            icon: Search,
            label: "Tìm",
            onClick,
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Tìm" }));

    expect(onClick).toHaveBeenCalled();
  });
});

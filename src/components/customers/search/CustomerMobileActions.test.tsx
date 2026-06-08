import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { commonTexts } from "@/constants/texts";
import { CustomerMobileActions } from "./CustomerMobileActions";

describe("CustomerMobileActions", () => {
  it("should render create visit navigation in bottom nav", () => {
    render(<CustomerMobileActions />);

    expect(
      screen.getByRole("link", { name: commonTexts.navigation.create }),
    ).toHaveAttribute("href", ROUTES.createVisit);
  });
});

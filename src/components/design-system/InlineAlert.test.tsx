import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InlineAlert } from "@/components/design-system/InlineAlert";

describe("InlineAlert", () => {
  it("should render alert content", () => {
    render(<InlineAlert>Thông tin không hợp lệ</InlineAlert>);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Thông tin không hợp lệ",
    );
  });

  it("should render nothing without content", () => {
    render(<InlineAlert />);

    expect(screen.queryByRole("alert")).toBeNull();
  });
});

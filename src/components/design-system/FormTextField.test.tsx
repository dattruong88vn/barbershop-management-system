import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FormTextField } from "@/components/design-system/FormTextField";

describe("FormTextField", () => {
  it("should render label, required marker, value, and call onChange", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <FormTextField
        id="username"
        label="Tên đăng nhập"
        value=""
        required
        onChange={handleChange}
      />,
    );

    expect(screen.getByLabelText("Tên đăng nhập")).toBeRequired();
    expect(screen.getByText("*")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Tên đăng nhập"), "dat");

    expect(handleChange).toHaveBeenCalled();
  });

  it("should mark the input invalid and render an error", () => {
    render(
      <FormTextField
        id="phone"
        label="Số điện thoại"
        value="123"
        error="Số điện thoại không hợp lệ"
        onChange={() => undefined}
      />,
    );

    expect(screen.getByLabelText("Số điện thoại")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("Số điện thoại không hợp lệ")).toBeInTheDocument();
  });
});

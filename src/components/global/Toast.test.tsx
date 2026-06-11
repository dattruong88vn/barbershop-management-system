import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Toast } from "@/components/global/Toast";

describe("Toast", () => {
  it("should render a toast message and description", () => {
    render(
      <Toast
        toast={{
          description: "Nguyễn Văn Nam đã được thêm vào hệ thống.",
          message: "Tạo khách thành công",
          type: "success",
        }}
        onClose={() => undefined}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Tạo khách thành công",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Nguyễn Văn Nam đã được thêm vào hệ thống.",
    );
  });

  it("should call onClose from the close button", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <Toast
        toast={{
          message: "Có lỗi xảy ra",
          type: "error",
        }}
        onClose={handleClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Đóng thông báo" }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

import { render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { commonTexts } from "@/constants/texts";
import { API_SERVER_ERROR_EVENT } from "@/lib/queryClient";
import { APP_TOAST_EVENT } from "@/lib/toast";
import { Providers } from "@/app/providers";

afterEach(() => {
  vi.useRealTimers();
});

describe("Providers", () => {
  it("should render children and show a toast for server errors", async () => {
    vi.useFakeTimers();

    render(
      <Providers>
        <div>child content</div>
      </Providers>,
    );

    expect(screen.getByText("child content")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(
        new CustomEvent(API_SERVER_ERROR_EVENT, {
          detail: commonTexts.api.errors.serverErrorToast,
        }),
      );
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      commonTexts.api.errors.serverErrorToast,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(screen.queryByRole("status")).toBeNull();
  });

  it("should show and close app toasts", async () => {
    render(
      <Providers>
        <div>child content</div>
      </Providers>,
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent(APP_TOAST_EVENT, {
          detail: {
            description: "Nguyễn Văn Nam đã được thêm vào hệ thống.",
            message: "Tạo khách thành công",
            type: "success",
          },
        }),
      );
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Tạo khách thành công",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Nguyễn Văn Nam đã được thêm vào hệ thống.",
    );

    act(() => {
      screen.getByRole("button", { name: "Đóng thông báo" }).click();
    });

    expect(screen.queryByRole("status")).toBeNull();
  });
});

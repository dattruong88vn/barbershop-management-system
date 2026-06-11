import { render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { commonTexts } from "@/constants/texts";
import { ROUTES } from "@/constants/routes";
import { APP_NAVIGATION_EVENT } from "@/lib/appNavigation";
import { API_SERVER_ERROR_EVENT } from "@/lib/queryClient";
import { APP_TOAST_DISMISS_EVENT, APP_TOAST_EVENT } from "@/lib/toast";
import { Providers } from "@/app/providers";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
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

  it("should dismiss app toasts from the dismiss event", () => {
    render(
      <Providers>
        <div>child content</div>
      </Providers>,
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent(APP_TOAST_EVENT, {
          detail: {
            message: "Vui lòng chọn barber/skinner",
            type: "warning",
          },
        }),
      );
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Vui lòng chọn barber/skinner",
    );

    act(() => {
      window.dispatchEvent(new Event(APP_TOAST_DISMISS_EVENT));
    });

    expect(screen.queryByRole("status")).toBeNull();
  });

  it("should navigate app routes through the Next router", () => {
    render(
      <Providers>
        <div>child content</div>
      </Providers>,
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent(APP_NAVIGATION_EVENT, {
          detail: {
            href: ROUTES.login,
          },
        }),
      );
    });

    expect(mocks.push).toHaveBeenCalledWith(ROUTES.login);
  });
});

import { render, screen, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { API_ROUTES, ROUTES } from "@/constants/routes";
import { commonTexts } from "@/constants/texts";
import { APP_NAVIGATION_EVENT } from "@/lib/appNavigation";
import { API_SERVER_ERROR_EVENT } from "@/lib/queryClient";
import { APP_TOAST_DISMISS_EVENT, APP_TOAST_EVENT } from "@/lib/toast";
import { Providers } from "@/app/providers";

const mocks = vi.hoisted(() => ({
  fetchClient: vi.fn(),
  push: vi.fn(),
  signOut: vi.fn(),
  usePathname: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock("@/lib/fetchClient", () => ({
  fetchClient: mocks.fetchClient,
}));

vi.mock("@/hooks/useBranches", () => ({
  useBranches: () => ({
    branches: [],
  }),
}));

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: ReactNode }) => children,
  signOut: mocks.signOut,
  useSession: mocks.useSession,
}));

vi.mock("next/navigation", () => ({
  usePathname: mocks.usePathname,
  useRouter: () => ({
    push: mocks.push,
  }),
}));

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

function mockSession(role?: string) {
  mocks.usePathname.mockReturnValue(ROUTES.login);
  mocks.useSession.mockReturnValue({
    data: role
      ? {
          user: {
            role,
          },
        }
      : null,
    status: role ? "authenticated" : "unauthenticated",
  });
}

describe("Providers", () => {
  it("should render children and show a toast for server errors", async () => {
    vi.useFakeTimers();
    mockSession();

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
    mockSession();

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
    mockSession();

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
    mockSession();

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

  it("should sign out before navigating to login for auth failures", () => {
    mockSession("manager");

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
            signOut: true,
          },
        }),
      );
    });

    expect(mocks.signOut).toHaveBeenCalledWith({
      callbackUrl: ROUTES.login,
    });
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("should warm location province cache for management roles", async () => {
    mockSession("manager");
    mocks.fetchClient.mockResolvedValue({ provinces: [] });

    render(
      <Providers>
        <div>child content</div>
      </Providers>,
    );

    await vi.waitFor(() => {
      expect(mocks.fetchClient).toHaveBeenCalledWith(
        API_ROUTES.locationProvinces,
      );
    });
  });

  it("should not warm location province cache for staff roles", async () => {
    mockSession("barber");

    render(
      <Providers>
        <div>child content</div>
      </Providers>,
    );

    expect(mocks.fetchClient).not.toHaveBeenCalled();
  });
});

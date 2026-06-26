import { describe, expect, it, vi } from "vitest";

import { APP_NAVIGATION_EVENT, dispatchAppNavigation } from "@/lib/appNavigation";

describe("dispatchAppNavigation", () => {
  it("should dispatch app navigation events with href detail", () => {
    const listener = vi.fn();

    window.addEventListener(APP_NAVIGATION_EVENT, listener);

    dispatchAppNavigation("/customers");

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          href: "/customers",
        },
      }),
    );

    window.removeEventListener(APP_NAVIGATION_EVENT, listener);
  });

  it("should dispatch sign out navigation detail when requested", () => {
    const listener = vi.fn();

    window.addEventListener(APP_NAVIGATION_EVENT, listener);

    dispatchAppNavigation("/login", { signOut: true });

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          href: "/login",
          signOut: true,
        },
      }),
    );

    window.removeEventListener(APP_NAVIGATION_EVENT, listener);
  });
});

import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import { getPostAuthRedirectPath } from "@/lib/authRedirect";

describe("getPostAuthRedirectPath", () => {
  it("should send owner and manager users to dashboard", () => {
    expect(getPostAuthRedirectPath("owner")).toBe(ROUTES.dashboard);
    expect(getPostAuthRedirectPath("manager")).toBe(ROUTES.dashboard);
  });

  it("should send other roles to customers", () => {
    expect(getPostAuthRedirectPath("receptionist")).toBe(ROUTES.customers);
    expect(getPostAuthRedirectPath("barber")).toBe(ROUTES.customers);
    expect(getPostAuthRedirectPath("skinner")).toBe(ROUTES.customers);
    expect(getPostAuthRedirectPath("superadmin")).toBe(ROUTES.customers);
    expect(getPostAuthRedirectPath(undefined)).toBe(ROUTES.customers);
  });
});

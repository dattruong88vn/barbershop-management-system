import { describe, expect, it } from "vitest";

import { hasResponseData } from "@/lib/apiResponse";

describe("hasResponseData", () => {
  it("should return true when response contains object data for key", () => {
    const response = {
      branch: {
        id: "branch-1",
      },
    };

    expect(hasResponseData<"branch", { id: string }>(response, "branch")).toBe(
      true,
    );
  });

  it("should return false when response data is missing", () => {
    const response: Partial<Record<"branch", { id: string }>> = {};

    expect(hasResponseData<"branch", { id: string }>(response, "branch")).toBe(
      false,
    );
  });

  it("should return false when response data is null", () => {
    const response = {
      branch: null,
    };

    expect(
      hasResponseData<"branch", { id: string } | null>(response, "branch"),
    ).toBe(false);
  });
});

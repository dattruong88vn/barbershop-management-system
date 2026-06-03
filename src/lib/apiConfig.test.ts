import { describe, expect, it } from "vitest";

import { DEFAULT_JSON_HEADERS } from "@/lib/apiConfig";

describe("apiConfig", () => {
  it("should provide default json headers", () => {
    expect(DEFAULT_JSON_HEADERS).toEqual({
      "Content-Type": "application/json",
    });
  });
});

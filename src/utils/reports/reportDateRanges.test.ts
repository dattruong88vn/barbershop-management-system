import { describe, expect, it } from "vitest";

import {
  formatReportDateRangeLabel,
  parseReportDateRange,
} from "./reportDateRanges";

describe("reportDateRanges", () => {
  it("parses an inclusive Vietnam date range with an exclusive next-day end", () => {
    const range = parseReportDateRange({
      fromDate: "2026-06-01",
      toDate: "2026-06-25",
    });

    expect(range?.start.toISOString()).toBe("2026-05-31T17:00:00.000Z");
    expect(range?.end.toISOString()).toBe("2026-06-25T17:00:00.000Z");
  });

  it("supports a one-day range", () => {
    const range = parseReportDateRange({
      fromDate: "2026-06-25",
      toDate: "2026-06-25",
    });

    expect(range?.start.toISOString()).toBe("2026-06-24T17:00:00.000Z");
    expect(range?.end.toISOString()).toBe("2026-06-25T17:00:00.000Z");
  });

  it("rejects invalid dates and reversed ranges", () => {
    expect(
      parseReportDateRange({
        fromDate: "2026-02-30",
        toDate: "2026-03-01",
      }),
    ).toBeNull();
    expect(
      parseReportDateRange({
        fromDate: "2026-06-26",
        toDate: "2026-06-25",
      }),
    ).toBeNull();
  });

  it("formats the report period label", () => {
    expect(formatReportDateRangeLabel("2026-06-01", "2026-06-25")).toBe(
      "01/06/2026 - 25/06/2026",
    );
  });
});

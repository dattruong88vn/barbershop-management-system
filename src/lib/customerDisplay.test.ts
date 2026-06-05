import { describe, expect, it } from "vitest";

import {
  formatCustomerRelativeDate,
  getCustomerInitials,
  hasCustomerPhotoWarning,
} from "@/lib/customerDisplay";
import type { Customer } from "@/types";

const baseCustomer: Customer = {
  id: "customer-1",
  shopId: "shop-1",
  name: "Nguyễn Văn Nam",
  phone: "0901234567",
  createdAt: "2026-06-03T01:00:00.000Z",
  lastVisit: null,
};

describe("customerDisplay", () => {
  it("should return initials from the first two words", () => {
    expect(getCustomerInitials("Nguyễn Văn Nam")).toBe("NV");
    expect(getCustomerInitials("")).toBe("?");
  });

  it("should format recent dates relatively", () => {
    expect(formatCustomerRelativeDate(new Date().toISOString())).toBe("Hôm nay");
  });

  it("should warn when last visit has services but no photos", () => {
    expect(
      hasCustomerPhotoWarning({
        ...baseCustomer,
        lastVisit: {
          id: "visit-1",
          createdAt: "2026-06-03T02:00:00.000Z",
          completedAt: null,
          barber: null,
          skinner: null,
          photos: [],
          services: [
            {
              id: "service-1",
              name: "Cắt tóc nam",
              price: 80000,
              type: "service",
            },
          ],
        },
      }),
    ).toBe(true);
    expect(hasCustomerPhotoWarning(baseCustomer)).toBe(false);
  });
});

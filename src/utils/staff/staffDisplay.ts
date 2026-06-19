import { staffTexts } from "@/constants/texts";
import type { Staff } from "@/types";

export const STAFF_PAGE_SIZE = 10;
export const ALL_FILTER_VALUE = "all";
export const STAFF_DISPLAY_STATUS_INITIALIZED = "initialized";
export const STAFF_DISPLAY_STATUS_ACTIVE = "active";

export type StaffDisplayStatus =
  | typeof STAFF_DISPLAY_STATUS_INITIALIZED
  | typeof STAFF_DISPLAY_STATUS_ACTIVE;

export function formatStaffPageSummary(
  start: number,
  end: number,
  total: number,
) {
  return staffTexts.ownerStaff.pageSummary
    .replace("{start}", String(start))
    .replace("{end}", String(end))
    .replace("{total}", String(total));
}

export function getStaffSearchText(staffMember: Staff) {
  return `${staffMember.fullName ?? ""} ${staffMember.username}`.toLowerCase();
}

export function getStaffDisplayStatus(
  staffMember: Staff,
): StaffDisplayStatus {
  return staffMember.isFirstLogin
    ? STAFF_DISPLAY_STATUS_INITIALIZED
    : STAFF_DISPLAY_STATUS_ACTIVE;
}

export const USER_ROLE_SUPERADMIN = "superadmin" as const;
export const USER_ROLE_OWNER = "owner" as const;
export const USER_ROLE_MANAGER = "manager" as const;
export const USER_ROLE_RECEPTIONIST = "receptionist" as const;
export const USER_ROLE_BARBER = "barber" as const;
export const USER_ROLE_SKINNER = "skinner" as const;

export const USER_ROLES = [
  USER_ROLE_SUPERADMIN,
  USER_ROLE_OWNER,
  USER_ROLE_MANAGER,
  USER_ROLE_RECEPTIONIST,
  USER_ROLE_BARBER,
  USER_ROLE_SKINNER,
] as const;

export const STAFF_ROLES = [
  USER_ROLE_RECEPTIONIST,
  USER_ROLE_BARBER,
  USER_ROLE_SKINNER,
] as const;

export const MANAGEMENT_ROLES = [USER_ROLE_OWNER, USER_ROLE_MANAGER] as const;

export type UserRoleValue = (typeof USER_ROLES)[number];
export type StaffRoleValue = (typeof STAFF_ROLES)[number];
export type ManagementRoleValue = (typeof MANAGEMENT_ROLES)[number];

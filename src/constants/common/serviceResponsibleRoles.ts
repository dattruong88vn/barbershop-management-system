export const SERVICE_RESPONSIBLE_ROLE_BARBER = "barber" as const;
export const SERVICE_RESPONSIBLE_ROLE_SKINNER = "skinner" as const;

export const SERVICE_RESPONSIBLE_ROLES = [
  SERVICE_RESPONSIBLE_ROLE_BARBER,
  SERVICE_RESPONSIBLE_ROLE_SKINNER,
] as const;

export type ServiceResponsibleRoleValue =
  (typeof SERVICE_RESPONSIBLE_ROLES)[number];

export function isServiceResponsibleRole(
  value: unknown,
): value is ServiceResponsibleRoleValue {
  return (
    typeof value === "string" &&
    SERVICE_RESPONSIBLE_ROLES.some((role) => role === value)
  );
}

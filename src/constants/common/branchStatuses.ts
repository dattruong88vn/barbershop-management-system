export const BRANCH_STATUS_ACTIVE = "active" as const;
export const BRANCH_STATUS_INACTIVE = "inactive" as const;
export const BRANCH_STATUS_ALL = "all" as const;

export type BranchStatusValue =
  | typeof BRANCH_STATUS_ACTIVE
  | typeof BRANCH_STATUS_INACTIVE;

export type BranchStatusFilterValue =
  | BranchStatusValue
  | typeof BRANCH_STATUS_ALL;

import type { BranchStatusFilterValue } from "@/constants/common";

export type BranchFilters = {
  search: string;
  status: BranchStatusFilterValue;
};

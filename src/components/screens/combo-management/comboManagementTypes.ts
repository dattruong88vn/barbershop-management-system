import type { BadgeProps } from "@/components/global";
import {
  SERVICE_SCOPE_BRANCH,
  SERVICE_SCOPE_SHOP,
  UI_VARIANT_INFO,
  UI_VARIANT_WARNING,
  type ServiceScopeValue,
} from "@/constants/common";

export const COMBO_SCOPE_BADGE_VARIANTS: Record<
  ServiceScopeValue,
  BadgeProps["variant"]
> = {
  [SERVICE_SCOPE_BRANCH]: UI_VARIANT_WARNING,
  [SERVICE_SCOPE_SHOP]: UI_VARIANT_INFO,
};

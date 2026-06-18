import { ComboManagementScreen } from "@/components/screens/combo-management";
import { USER_ROLE_OWNER } from "@/constants/common";

export default function OwnerCombosPage() {
  return <ComboManagementScreen mode={USER_ROLE_OWNER} />;
}

import { ComboManagementScreen } from "@/components/screens/combo-management";
import { USER_ROLE_MANAGER } from "@/constants/common";

export default function ManagerCombosPage() {
  return <ComboManagementScreen mode={USER_ROLE_MANAGER} />;
}

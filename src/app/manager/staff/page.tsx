import { StaffManagementScreen } from "@/components/screens/staff-management";
import { USER_ROLE_MANAGER } from "@/constants/common";

export default function ManagerStaffPage() {
  return <StaffManagementScreen mode={USER_ROLE_MANAGER} />;
}

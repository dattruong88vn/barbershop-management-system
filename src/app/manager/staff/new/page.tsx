import { StaffFormScreen } from "@/components/screens/staff-management";
import { USER_ROLE_MANAGER } from "@/constants/common";

export default function ManagerStaffCreatePage() {
  return <StaffFormScreen mode={USER_ROLE_MANAGER} />;
}

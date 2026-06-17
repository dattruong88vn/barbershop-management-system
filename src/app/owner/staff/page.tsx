import { StaffManagementScreen } from "@/components/screens/staff-management";
import { USER_ROLE_OWNER } from "@/constants/common";

export default function OwnerStaffPage() {
  return <StaffManagementScreen mode={USER_ROLE_OWNER} />;
}

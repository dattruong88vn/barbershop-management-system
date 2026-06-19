import { StaffFormScreen } from "@/components/screens/staff-management";
import { USER_ROLE_OWNER } from "@/constants/common";

export default function OwnerStaffCreatePage() {
  return <StaffFormScreen mode={USER_ROLE_OWNER} />;
}

import { StaffFormScreen } from "@/components/screens/staff-management";
import { USER_ROLE_MANAGER } from "@/constants/common";

export default async function ManagerStaffEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StaffFormScreen mode={USER_ROLE_MANAGER} staffId={id} />;
}

import { StaffFormScreen } from "@/components/screens/staff-management";
import { USER_ROLE_OWNER } from "@/constants/common";

export default async function OwnerStaffEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StaffFormScreen mode={USER_ROLE_OWNER} staffId={id} />;
}

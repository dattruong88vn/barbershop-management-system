import { ServiceManagementScreen } from "@/components/screens/service-management";
import { USER_ROLE_OWNER } from "@/constants/common";

export default function OwnerServicesPage() {
  return <ServiceManagementScreen mode={USER_ROLE_OWNER} />;
}

import { ServiceManagementScreen } from "@/components/screens/service-management";
import { USER_ROLE_MANAGER } from "@/constants/common";

export default function ManagerServicesPage() {
  return <ServiceManagementScreen mode={USER_ROLE_MANAGER} />;
}

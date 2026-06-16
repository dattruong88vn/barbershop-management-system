import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import {
  ManagerReportPlaceholder,
  PersonalReportView,
} from "@/components/modules/reports";
import { MANAGEMENT_ROLES, STAFF_ROLES } from "@/constants/common";
import { ROUTES } from "@/constants/routes";
import { authOptions } from "@/lib/auth";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;

  if (
    role &&
    MANAGEMENT_ROLES.some((managementRole) => managementRole === role)
  ) {
    redirect(ROUTES.reportRevenue);
  }

  if (role && STAFF_ROLES.some((staffRole) => staffRole === role)) {
    return <PersonalReportView />;
  }

  return <ManagerReportPlaceholder />;
}

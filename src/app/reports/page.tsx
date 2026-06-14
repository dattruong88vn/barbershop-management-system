import { getServerSession } from "next-auth";

import {
  ManagerReportPlaceholder,
  PersonalReportView,
} from "@/components/modules/reports";
import { STAFF_ROLES } from "@/constants/common";
import { authOptions } from "@/lib/auth";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;

  if (role && STAFF_ROLES.some((staffRole) => staffRole === role)) {
    return <PersonalReportView />;
  }

  return <ManagerReportPlaceholder />;
}

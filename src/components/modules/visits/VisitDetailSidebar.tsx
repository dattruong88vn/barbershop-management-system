import type { CustomerVisit } from "@/types";
import { VisitStaffSection } from "./VisitStaffSection";

export function VisitDetailSidebar({ visit }: { visit: CustomerVisit }) {
  return (
    <aside className="space-y-4">
      <VisitStaffSection visit={visit} />
    </aside>
  );
}

import {
  Badge,
  Button,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/global";
import { staffTexts } from "@/constants/texts";
import type { Staff } from "@/types";
import { formatDisplayDate } from "@/utils/common";
import { getStaffDisplayStatus } from "@/utils/staff";

import {
  STAFF_ROLE_BADGE_VARIANTS,
  STAFF_STATUS_BADGE_VARIANTS,
} from "./ownerStaffTypes";

type OwnerStaffDetailModalProps = {
  onEdit: (staffMember: Staff) => void;
  onOpenChange: (open: boolean) => void;
  staffMember: Staff | null;
};

export function OwnerStaffDetailModal({
  onEdit,
  onOpenChange,
  staffMember,
}: OwnerStaffDetailModalProps) {
  const displayStatus = staffMember ? getStaffDisplayStatus(staffMember) : null;

  return (
    <Modal
      open={Boolean(staffMember)}
      title={staffTexts.ownerStaff.detailTitle}
      onOpenChange={onOpenChange}
    >
      {staffMember && displayStatus ? (
        <div>
          <div className="overflow-hidden rounded-lg border border-gray-400">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="w-1/2 bg-gray-200 font-medium">
                    {staffTexts.ownerStaff.usernameLabel}
                  </TableCell>
                  <TableCell>{staffMember.username}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="w-1/2 bg-gray-200 font-medium">
                    {staffTexts.ownerStaff.roleLabel}
                  </TableCell>
                  <TableCell>
                    <Badge
                      size="sm"
                      variant={STAFF_ROLE_BADGE_VARIANTS[staffMember.role]}
                    >
                      {staffTexts.ownerStaff.roles[staffMember.role]}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="w-1/2 bg-gray-200 font-medium">
                    {staffTexts.ownerStaff.branchLabel}
                  </TableCell>
                  <TableCell>
                    {staffMember.branch?.name ??
                      staffTexts.ownerStaff.branchEmpty}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="w-1/2 bg-gray-200 font-medium">
                    {staffTexts.ownerStaff.statusLabel}
                  </TableCell>
                  <TableCell>
                    <Badge
                      size="sm"
                      variant={STAFF_STATUS_BADGE_VARIANTS[displayStatus]}
                    >
                      {staffTexts.ownerStaff.statuses[displayStatus]}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="w-1/2 bg-gray-200 font-medium">
                    {staffTexts.ownerStaff.createdAtLabel}
                  </TableCell>
                  <TableCell>
                    {formatDisplayDate(staffMember.createdAt)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onEdit(staffMember)}
            >
              {staffTexts.ownerStaff.edit}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

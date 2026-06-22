import {
  Badge,
  Button,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/global";
import {
  USER_ROLE_MANAGER,
  UI_VARIANT_SECONDARY,
} from "@/constants/common";
import { staffTexts } from "@/constants/texts";
import type { Staff } from "@/types";
import { formatDisplayDate } from "@/utils/common";
import { getStaffDisplayStatus } from "@/utils/staff";

import {
  STAFF_ROLE_BADGE_VARIANTS,
  STAFF_STATUS_BADGE_VARIANTS,
} from "./ownerStaffTypes";

function getStaffBranchLabel(staffMember: Staff) {
  if (staffMember.role === USER_ROLE_MANAGER) {
    return staffMember.managedBranches?.length
      ? staffMember.managedBranches.map((branch) => branch.name).join(", ")
      : staffTexts.ownerStaff.branchEmpty;
  }

  return staffMember.branch?.name ?? staffTexts.ownerStaff.branchEmpty;
}

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
  const branchLabel =
    staffMember?.role === USER_ROLE_MANAGER
      ? staffTexts.ownerStaff.managedBranchesLabel
      : staffTexts.ownerStaff.branchLabel;

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
                    {staffTexts.ownerStaff.fullNameLabel}
                  </TableCell>
                  <TableCell>{staffMember.fullName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="w-1/2 bg-gray-200 font-medium">
                    {staffTexts.ownerStaff.usernameLabel}
                  </TableCell>
                  <TableCell>{staffMember.username}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="w-1/2 bg-gray-200 font-medium">{staffTexts.ownerStaff.phoneLabel}</TableCell>
                  <TableCell>{staffMember.phone}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="w-1/2 bg-gray-200 font-medium">{staffTexts.ownerStaff.dateOfBirthLabel}</TableCell>
                  <TableCell>{staffMember.dateOfBirth ? formatDisplayDate(staffMember.dateOfBirth) : ""}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="w-1/2 bg-gray-200 font-medium">{staffTexts.ownerStaff.genderLabel}</TableCell>
                  <TableCell>{staffMember.gender ? staffTexts.ownerStaff.genders[staffMember.gender] : ""}</TableCell>
                </TableRow>
                {staffMember.hometown ? (
                  <TableRow>
                    <TableCell className="w-1/2 bg-gray-200 font-medium">{staffTexts.ownerStaff.hometownLabel}</TableCell>
                    <TableCell>{staffMember.hometown}</TableCell>
                  </TableRow>
                ) : null}
                {staffMember.currentAddress ? (
                  <TableRow>
                    <TableCell className="w-1/2 bg-gray-200 font-medium">{staffTexts.ownerStaff.currentAddressLabel}</TableCell>
                    <TableCell>{staffMember.currentAddress}</TableCell>
                  </TableRow>
                ) : null}
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
                    {branchLabel}
                  </TableCell>
                  <TableCell>
                    {getStaffBranchLabel(staffMember)}
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
              variant={UI_VARIANT_SECONDARY}
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

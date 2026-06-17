import { Button, Error as FeedbackError, Modal } from "@/components/global";
import { staffTexts } from "@/constants/texts";
import type { Staff } from "@/types";

type OwnerStaffDeleteModalProps = {
  error: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  staffMember: Staff | null;
};

export function OwnerStaffDeleteModal({
  error,
  isDeleting,
  onConfirm,
  onOpenChange,
  staffMember,
}: OwnerStaffDeleteModalProps) {
  return (
    <Modal
      description={staffTexts.ownerStaff.deleteConfirmDescription}
      open={Boolean(staffMember)}
      title={staffTexts.ownerStaff.deleteConfirmTitle}
      onOpenChange={onOpenChange}
    >
      {error ? <FeedbackError className="mb-4" message={error} /> : null}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onOpenChange(false)}
        >
          {staffTexts.ownerStaff.deleteCancel}
        </Button>
        <Button
          loading={isDeleting}
          type="button"
          variant="danger"
          onClick={onConfirm}
        >
          {staffTexts.ownerStaff.delete}
        </Button>
      </div>
    </Modal>
  );
}

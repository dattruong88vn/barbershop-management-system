import { Button, Error as FeedbackError, Modal, Select } from "@/components/global";
import { UI_VARIANT_SECONDARY } from "@/constants/common";
import { branchTexts } from "@/constants/texts";
import type { Branch } from "@/types";

type Props = {
  branches: Branch[];
  error: string;
  isOpen: boolean;
  isTransferring: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  onTargetBranchIdChange: (id: string) => void;
  targetBranchId: string;
};

export function BranchStaffTransferModal({
  branches,
  error,
  isOpen,
  isTransferring,
  onConfirm,
  onOpenChange,
  onTargetBranchIdChange,
  targetBranchId,
}: Props) {
  return (
    <Modal open={isOpen} title={branchTexts.ownerBranches.transferTitle} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {branchTexts.ownerBranches.transferTargetLabel}
          </span>
          <Select
            className="mt-2"
            value={targetBranchId}
            onChange={(event) => onTargetBranchIdChange(event.target.value)}
          >
            <option value="">{branchTexts.ownerBranches.transferTargetPlaceholder}</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} — {branch.address}
              </option>
            ))}
          </Select>
        </label>

        {error ? <FeedbackError message={error} /> : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant={UI_VARIANT_SECONDARY} onClick={() => onOpenChange(false)}>
            {branchTexts.ownerBranches.cancel}
          </Button>
          <Button
            disabled={!targetBranchId}
            loading={isTransferring}
            type="button"
            onClick={onConfirm}
          >
            {branchTexts.ownerBranches.transferConfirm}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

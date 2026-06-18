import { Button, Error as FeedbackError, Modal } from "@/components/global";
import { UI_VARIANT_DANGER, UI_VARIANT_SECONDARY } from "@/constants/common";
import { comboTexts } from "@/constants/texts";
import type { Combo } from "@/types";

type ComboDeleteModalProps = {
  combo: Combo | null;
  error: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};

export function ComboDeleteModal({
  combo,
  error,
  isDeleting,
  onConfirm,
  onOpenChange,
}: ComboDeleteModalProps) {
  return (
    <Modal
      open={Boolean(combo)}
      title={comboTexts.ownerCombos.deleteConfirmTitle}
      onOpenChange={onOpenChange}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          {comboTexts.ownerCombos.deleteConfirmDescription}
        </p>

        {combo ? (
          <p className="rounded-lg border border-gray-400 bg-gray-200 px-3 py-2 text-sm font-medium text-gray-1000">
            {combo.name}
          </p>
        ) : null}

        {error ? <FeedbackError message={error} /> : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant={UI_VARIANT_SECONDARY}
            onClick={() => onOpenChange(false)}
          >
            {comboTexts.ownerCombos.deleteCancel}
          </Button>
          <Button
            loading={isDeleting}
            type="button"
            variant={UI_VARIANT_DANGER}
            onClick={onConfirm}
          >
            {comboTexts.ownerCombos.delete}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { Button, Error as FeedbackError, Modal } from "@/components/global";
import { serviceTexts } from "@/constants/texts";
import type { Service } from "@/types";

type ServiceDeleteModalProps = {
  error: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
};

export function ServiceDeleteModal({
  error,
  isDeleting,
  onConfirm,
  onOpenChange,
  service,
}: ServiceDeleteModalProps) {
  return (
    <Modal
      description={serviceTexts.ownerServices.deleteConfirmDescription}
      open={Boolean(service)}
      title={serviceTexts.ownerServices.deleteConfirmTitle}
      onOpenChange={onOpenChange}
    >
      {error ? <FeedbackError className="mb-4" message={error} /> : null}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onOpenChange(false)}
        >
          {serviceTexts.ownerServices.deleteCancel}
        </Button>
        <Button
          loading={isDeleting}
          type="button"
          variant="danger"
          onClick={onConfirm}
        >
          {serviceTexts.ownerServices.delete}
        </Button>
      </div>
    </Modal>
  );
}

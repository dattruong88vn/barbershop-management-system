import type { FormEvent } from "react";

import {
  Button,
  Error as FeedbackError,
  Input,
  Modal,
  Select,
} from "@/components/global";
import {
  SERVICE_RESPONSIBLE_ROLE_BARBER,
  SERVICE_RESPONSIBLE_ROLE_SKINNER,
  UI_VARIANT_SECONDARY,
  type ServiceResponsibleRoleValue,
} from "@/constants/common";
import { serviceTexts } from "@/constants/texts";
import type { Service } from "@/types";

export type ServiceResponsibleRoleFormValue =
  | ServiceResponsibleRoleValue
  | "";

type ServiceFormModalProps = {
  editingService: Service | null;
  error: string;
  isOpen: boolean;
  isSubmitting: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onPriceChange: (price: string) => void;
  onResponsibleRoleChange: (role: ServiceResponsibleRoleFormValue) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  price: string;
  responsibleRole: ServiceResponsibleRoleFormValue;
};

export function ServiceFormModal({
  editingService,
  error,
  isOpen,
  isSubmitting,
  name,
  onNameChange,
  onOpenChange,
  onPriceChange,
  onResponsibleRoleChange,
  onSubmit,
  price,
  responsibleRole,
}: ServiceFormModalProps) {
  return (
    <Modal
      open={isOpen}
      title={
        editingService
          ? serviceTexts.ownerServices.editTitle
          : serviceTexts.ownerServices.createTitle
      }
      onOpenChange={onOpenChange}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {serviceTexts.ownerServices.nameLabel}
          </span>
          <Input
            className="mt-2"
            placeholder={serviceTexts.ownerServices.namePlaceholder}
            required
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {serviceTexts.ownerServices.priceLabel}
          </span>
          <Input
            className="mt-2"
            inputMode="numeric"
            placeholder={serviceTexts.ownerServices.pricePlaceholder}
            value={price}
            onChange={(event) => onPriceChange(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {serviceTexts.ownerServices.responsibleRoleLabel}
          </span>
          <Select
            className="mt-2"
            value={responsibleRole}
            onChange={(event) =>
              onResponsibleRoleChange(
                event.target.value as ServiceResponsibleRoleFormValue,
              )
            }
          >
            <option disabled value="">
              {serviceTexts.ownerServices.responsibleRolePlaceholder}
            </option>
            <option value={SERVICE_RESPONSIBLE_ROLE_BARBER}>
              {
                serviceTexts.ownerServices.responsibleRoles[
                  SERVICE_RESPONSIBLE_ROLE_BARBER
                ]
              }
            </option>
            <option value={SERVICE_RESPONSIBLE_ROLE_SKINNER}>
              {
                serviceTexts.ownerServices.responsibleRoles[
                  SERVICE_RESPONSIBLE_ROLE_SKINNER
                ]
              }
            </option>
          </Select>
        </label>

        {error ? <FeedbackError message={error} /> : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant={UI_VARIANT_SECONDARY}
            onClick={() => onOpenChange(false)}
          >
            {serviceTexts.ownerServices.cancelEdit}
          </Button>
          <Button loading={isSubmitting} type="submit">
            {editingService
              ? serviceTexts.ownerServices.submitUpdate
              : serviceTexts.ownerServices.submitCreate}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

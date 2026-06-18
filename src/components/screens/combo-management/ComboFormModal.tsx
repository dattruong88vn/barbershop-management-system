import type { FormEvent } from "react";

import {
  Badge,
  Button,
  Checkbox,
  Error as FeedbackError,
  Feedback,
  Input,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Textarea,
} from "@/components/global";
import {
  SERVICE_SCOPE_BRANCH,
  SERVICE_SCOPE_SHOP,
  UI_FEEDBACK_TYPE_WARNING,
  UI_VARIANT_SECONDARY,
  type ServiceScopeValue,
} from "@/constants/common";
import { comboTexts } from "@/constants/texts";
import type { Combo, Service } from "@/types";
import { formatVndPrice } from "@/utils/common";

import { COMBO_SCOPE_BADGE_VARIANTS } from "./comboManagementTypes";

type ComboFormModalProps = {
  description: string;
  editingCombo: Combo | null;
  error: string;
  hasDuplicateNoAvailableServices: boolean;
  hasDuplicateUnavailableServices: boolean;
  isDuplicating: boolean;
  isLoadingServices: boolean;
  isOpen: boolean;
  isSubmitting: boolean;
  name: string;
  onDescriptionChange: (description: string) => void;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onPriceChange: (price: string) => void;
  onServiceToggle: (serviceId: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  price: string;
  priceWarning: boolean;
  selectedServiceIds: string[];
  selectedServicesTotal: number;
  services: Service[];
  servicesError: Error | null;
};

function getScopeLabel(service: Service) {
  if (service.branch) {
    return service.branch.name;
  }

  return comboTexts.ownerCombos.scopes.shop;
}

function getScopeValue(service: Service): ServiceScopeValue {
  return service.scope ?? (service.branchId ? SERVICE_SCOPE_BRANCH : SERVICE_SCOPE_SHOP);
}

export function ComboFormModal({
  description,
  editingCombo,
  error,
  hasDuplicateNoAvailableServices,
  hasDuplicateUnavailableServices,
  isDuplicating,
  isLoadingServices,
  isOpen,
  isSubmitting,
  name,
  onDescriptionChange,
  onNameChange,
  onOpenChange,
  onPriceChange,
  onServiceToggle,
  onSubmit,
  price,
  priceWarning,
  selectedServiceIds,
  selectedServicesTotal,
  services,
  servicesError,
}: ComboFormModalProps) {
  return (
    <Modal
      containerClassName="max-w-4xl"
      open={isOpen}
      title={
        editingCombo
          ? comboTexts.ownerCombos.editTitle
          : isDuplicating
            ? comboTexts.ownerCombos.duplicateTitle
          : comboTexts.ownerCombos.createTitle
      }
      onOpenChange={onOpenChange}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {comboTexts.ownerCombos.nameLabel}
          </span>
          <Input
            className="mt-2"
            placeholder={comboTexts.ownerCombos.namePlaceholder}
            required
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {comboTexts.ownerCombos.descriptionLabel}
          </span>
          <Textarea
            className="mt-2"
            placeholder={comboTexts.ownerCombos.descriptionPlaceholder}
            required
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-1000">
            {comboTexts.ownerCombos.priceLabel}
          </span>
          <Input
            className="mt-2"
            inputMode="numeric"
            placeholder={comboTexts.ownerCombos.pricePlaceholder}
            value={price}
            onChange={(event) => onPriceChange(event.target.value)}
          />
        </label>

        <div className="rounded-lg border border-gray-400 bg-gray-100 px-3 py-2">
          <p className="text-sm font-medium text-gray-1000">
            {comboTexts.ownerCombos.selectedServicesTotalLabel}
          </p>
          <p className="mt-1 text-base font-semibold text-gray-1000">
            {formatVndPrice(selectedServicesTotal)}
          </p>
        </div>

        {priceWarning ? (
          <Feedback
            message={comboTexts.ownerCombos.priceAboveServicesWarning}
            type={UI_FEEDBACK_TYPE_WARNING}
          />
        ) : null}

        {hasDuplicateNoAvailableServices ? (
          <Feedback
            message={comboTexts.ownerCombos.duplicateNoAvailableServicesWarning}
            type={UI_FEEDBACK_TYPE_WARNING}
          />
        ) : null}

        {hasDuplicateUnavailableServices ? (
          <Feedback
            message={comboTexts.ownerCombos.duplicateUnavailableServicesWarning}
            type={UI_FEEDBACK_TYPE_WARNING}
          />
        ) : null}

        <div>
          <p className="text-sm font-medium text-gray-1000">
            {comboTexts.ownerCombos.servicesLabel}
          </p>

          {isLoadingServices ? (
            <p className="mt-2 text-sm text-gray-700">
              {comboTexts.ownerCombos.loading}
            </p>
          ) : null}

          {servicesError ? (
            <FeedbackError
              className="mt-2"
              message={
                servicesError.message ?? comboTexts.ownerCombos.errors.generic
              }
            />
          ) : null}

          {!isLoadingServices && !servicesError && services.length === 0 ? (
            <p className="mt-2 text-sm text-gray-700">
              {comboTexts.ownerCombos.emptyServices}
            </p>
          ) : null}

          {!isLoadingServices && !servicesError && services.length > 0 ? (
            <div className="mt-2 max-h-72 overflow-auto rounded-lg border border-gray-400">
              <Table>
                <TableHead>
                  <TableRow>
                    <th className="w-12 px-4 py-3 text-left font-semibold text-gray-1000" />
                    <th className="min-w-48 px-4 py-3 text-left font-semibold text-gray-1000">
                      {comboTexts.ownerCombos.table.name}
                    </th>
                    <th className="min-w-32 px-4 py-3 text-left font-semibold text-gray-1000">
                      {comboTexts.ownerCombos.table.price}
                    </th>
                    <th className="min-w-36 px-4 py-3 text-left font-semibold text-gray-1000">
                      {comboTexts.ownerCombos.table.scope}
                    </th>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service) => {
                    const scope = getScopeValue(service);

                    return (
                      <TableRow key={service.id}>
                        <TableCell>
                          <Checkbox
                            aria-label={service.name}
                            checked={selectedServiceIds.includes(service.id)}
                            onChange={() => onServiceToggle(service.id)}
                          />
                        </TableCell>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>
                          {formatVndPrice(service.price)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            size="sm"
                            variant={COMBO_SCOPE_BADGE_VARIANTS[scope]}
                          >
                            {getScopeLabel(service)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </div>

        {error ? <FeedbackError message={error} /> : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant={UI_VARIANT_SECONDARY}
            onClick={() => onOpenChange(false)}
          >
            {comboTexts.ownerCombos.cancelEdit}
          </Button>
          <Button loading={isSubmitting} type="submit">
            {editingCombo
              ? comboTexts.ownerCombos.submitUpdate
              : isDuplicating
                ? comboTexts.ownerCombos.submitDuplicate
              : comboTexts.ownerCombos.submitCreate}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

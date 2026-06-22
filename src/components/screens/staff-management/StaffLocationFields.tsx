import {
  Combobox,
  InlineAlert,
  Input,
  type ComboboxOption,
} from "@/components/global";
import { staffTexts } from "@/constants/texts";
import type { Province, Ward } from "@/types";

type StaffLocationFieldsProps = {
  currentAddressLine: string;
  currentProvinceCode: string;
  currentWardCode: string;
  hometownProvinceCode: string;
  isLoadingProvinces: boolean;
  isLoadingWards: boolean;
  locationError: boolean;
  onCurrentAddressLineChange: (value: string) => void;
  onCurrentProvinceChange: (value: string) => void;
  onCurrentWardChange: (value: string) => void;
  onHometownProvinceChange: (value: string) => void;
  provinces: Province[];
  wards: Ward[];
};

export function StaffLocationFields({
  currentAddressLine,
  currentProvinceCode,
  currentWardCode,
  hometownProvinceCode,
  isLoadingProvinces,
  isLoadingWards,
  locationError,
  onCurrentAddressLineChange,
  onCurrentProvinceChange,
  onCurrentWardChange,
  onHometownProvinceChange,
  provinces,
  wards,
}: StaffLocationFieldsProps) {
  const currentProvinceIsMissing =
    Boolean(currentProvinceCode) &&
    !provinces.some((province) => province.code === currentProvinceCode);
  const hometownProvinceIsMissing =
    Boolean(hometownProvinceCode) &&
    !provinces.some((province) => province.code === hometownProvinceCode);
  const currentWardIsMissing =
    Boolean(currentWardCode) &&
    !wards.some((ward) => ward.code === currentWardCode);
  const provinceOptions: ComboboxOption[] = provinces.map((province) => ({
    label: province.fullName,
    value: province.code,
  }));
  const hometownProvinceOptions = hometownProvinceIsMissing
    ? [
        {
          label: hometownProvinceCode,
          value: hometownProvinceCode,
        },
        ...provinceOptions,
      ]
    : provinceOptions;
  const currentProvinceOptions = currentProvinceIsMissing
    ? [
        {
          label: currentProvinceCode,
          value: currentProvinceCode,
        },
        ...provinceOptions,
      ]
    : provinceOptions;
  const wardOptions: ComboboxOption[] = wards.map((ward) => ({
    label: ward.fullName,
    value: ward.code,
  }));
  const currentWardOptions = currentWardIsMissing
    ? [
        {
          label: currentWardCode,
          value: currentWardCode,
        },
        ...wardOptions,
      ]
    : wardOptions;

  return (
    <>
      {locationError ? (
        <InlineAlert className="sm:col-span-2">
          {staffTexts.ownerStaff.locationLoadError}
        </InlineAlert>
      ) : null}

      <label>
        <span className="text-sm font-medium">
          {staffTexts.ownerStaff.hometownProvinceLabel}
        </span>
        <div className="mt-2">
          <Combobox
            disabled={isLoadingProvinces}
            emptyMessage={staffTexts.ownerStaff.locationEmpty}
            label={staffTexts.ownerStaff.hometownProvinceLabel}
            options={hometownProvinceOptions}
            placeholder={
              isLoadingProvinces
                ? staffTexts.ownerStaff.locationLoading
                : staffTexts.ownerStaff.hometownProvincePlaceholder
            }
            searchable
            searchPlaceholder={staffTexts.ownerStaff.provinceSearchPlaceholder}
            value={hometownProvinceCode}
            onValueChange={onHometownProvinceChange}
          />
        </div>
      </label>

      <div className="sm:col-span-2">
        <span className="text-sm font-medium">
          {staffTexts.ownerStaff.currentAddressLabel}
        </span>
        <div className="mt-2 grid gap-3">
          <Combobox
            disabled={isLoadingProvinces}
            emptyMessage={staffTexts.ownerStaff.locationEmpty}
            label={staffTexts.ownerStaff.currentProvinceLabel}
            options={currentProvinceOptions}
            placeholder={
              isLoadingProvinces
                ? staffTexts.ownerStaff.locationLoading
                : staffTexts.ownerStaff.currentProvincePlaceholder
            }
            searchable
            searchPlaceholder={staffTexts.ownerStaff.provinceSearchPlaceholder}
            value={currentProvinceCode}
            onValueChange={onCurrentProvinceChange}
          />

          <Combobox
            disabled={!currentProvinceCode || isLoadingWards}
            emptyMessage={staffTexts.ownerStaff.noWards}
            label={staffTexts.ownerStaff.currentWardLabel}
            options={currentWardOptions}
            placeholder={
              isLoadingWards
                ? staffTexts.ownerStaff.locationLoading
                : currentProvinceCode && wards.length === 0 && !locationError
                  ? staffTexts.ownerStaff.noWards
                  : staffTexts.ownerStaff.currentWardPlaceholder
            }
            searchable
            searchPlaceholder={staffTexts.ownerStaff.wardSearchPlaceholder}
            value={currentWardCode}
            onValueChange={onCurrentWardChange}
          />

          <Input
            placeholder={staffTexts.ownerStaff.currentAddressLinePlaceholder}
            value={currentAddressLine}
            onChange={(event) => onCurrentAddressLineChange(event.target.value)}
          />
        </div>
      </div>
    </>
  );
}

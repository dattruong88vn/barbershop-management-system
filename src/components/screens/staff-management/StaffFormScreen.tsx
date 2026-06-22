"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button, Card, Error as FeedbackError, Input, MultiSelect, PageTitle, Select } from "@/components/global";
import { StaffIdentityImageField } from "@/components/screens/owner-staff";
import {
  BRANCH_STATUS_ACTIVE,
  OWNER_STAFF_ROLES,
  STAFF_ROLES,
  type StaffGenderValue,
  UI_VARIANT_SECONDARY,
  USER_ROLE_MANAGER,
  USER_ROLE_OWNER,
  USER_ROLE_RECEPTIONIST,
} from "@/constants/common";
import { API_ROUTES, ROUTES } from "@/constants/routes";
import { staffTexts } from "@/constants/texts";
import { useBranches } from "@/hooks/useBranches";
import { useLocations } from "@/hooks/useLocations";
import { useStaff } from "@/hooks/useStaff";
import { dispatchAppToast } from "@/lib/toast";
import type { StaffRole } from "@/types";

import type { StaffManagementMode } from "./StaffManagementScreen";
import { StaffFormSkeleton } from "./StaffFormSkeleton";
import { StaffLocationFields } from "./StaffLocationFields";

const MAX_IDENTITY_IMAGE_BYTES = 10 * 1024 * 1024;

type StaffFormScreenProps = {
  mode: StaffManagementMode;
  staffId?: string;
};

type StaffFormDraft = {
  branchId?: string;
  currentAddressLine?: string;
  currentAddress?: string;
  currentProvinceCode?: string;
  currentWardCode?: string;
  dateOfBirth?: string;
  fullName?: string;
  gender?: StaffGenderValue | "";
  hometown?: string;
  hometownProvinceCode?: string;
  managedBranchIds?: string[];
  password?: string;
  phone?: string;
  role?: StaffRole;
  username?: string;
};

export function StaffFormScreen({ mode, staffId }: StaffFormScreenProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { branches } = useBranches();
  const {
    createStaff,
    isCreating,
    isLoadingStaffMember,
    isUpdating,
    isUploadingIdentity,
    staffMember,
    updateStaff,
    uploadIdentityImage,
  } = useStaff(staffId);
  const [draft, setDraft] = useState<StaffFormDraft>({});
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [draftId] = useState(() => staffId ?? crypto.randomUUID());

  const isEdit = Boolean(staffId);
  const isManagerMode = mode === USER_ROLE_MANAGER;
  const managerBranchId = isManagerMode ? session?.user.branch_id ?? "" : "";
  const activeBranches = branches.filter(
    (branch) => (branch.status ?? BRANCH_STATUS_ACTIVE) === BRANCH_STATUS_ACTIVE,
  );
  const roleOptions = mode === USER_ROLE_OWNER ? OWNER_STAFF_ROLES : STAFF_ROLES;
  const listRoute = isManagerMode ? ROUTES.managerStaff : ROUTES.ownerStaff;
  const isSubmitting = isCreating || isUpdating || isUploadingIdentity;
  const username = draft.username ?? staffMember?.username ?? "";
  const fullName = draft.fullName ?? staffMember?.fullName ?? "";
  const phone = draft.phone ?? staffMember?.phone ?? "";
  const dateOfBirth = draft.dateOfBirth ?? staffMember?.dateOfBirth?.slice(0, 10) ?? "";
  const gender = draft.gender ?? staffMember?.gender ?? "";
  const hometown = draft.hometown ?? staffMember?.hometown ?? "";
  const currentAddress = draft.currentAddress ?? staffMember?.currentAddress ?? "";
  const hometownProvinceCode =
    draft.hometownProvinceCode ?? staffMember?.hometownProvinceCode ?? "";
  const currentProvinceCode =
    draft.currentProvinceCode ?? staffMember?.currentProvinceCode ?? "";
  const currentWardCode =
    draft.currentWardCode ?? staffMember?.currentWardCode ?? "";
  const currentAddressLine =
    draft.currentAddressLine ?? staffMember?.currentAddressLine ?? "";
  const {
    provinces,
    provincesError,
    isLoadingProvinces,
    wards,
    wardsError,
    isLoadingWards,
  } = useLocations(currentProvinceCode);
  const password = draft.password ?? "";
  const role = draft.role ?? staffMember?.role ?? USER_ROLE_RECEPTIONIST;
  const branchId =
    draft.branchId ?? (managerBranchId || staffMember?.branchId || "");
  const managedBranchIds =
    draft.managedBranchIds ?? staffMember?.managedBranches?.map((branch) => branch.id) ?? [];

  function updateDraft(update: StaffFormDraft) {
    setDraft((current) => ({ ...current, ...update }));
  }

  function validateIdentityFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError(staffTexts.ownerStaff.errors.invalidIdentityImage);
      return false;
    }
    if (file.size > MAX_IDENTITY_IMAGE_BYTES) {
      setError(staffTexts.ownerStaff.errors.identityImageTooLarge);
      return false;
    }
    setError("");
    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!fullName.trim() || !phone.trim() || !dateOfBirth || !gender || !username.trim()) {
      setError(staffTexts.ownerStaff.errors.generic);
      return;
    }
    try {
      const identityCardFrontKey = frontFile
        ? await uploadIdentityImage({ draftId, file: frontFile, side: "front", fileType: frontFile.type })
        : "";
      const identityCardBackKey = backFile
        ? await uploadIdentityImage({ draftId, file: backFile, side: "back", fileType: backFile.type })
        : "";
      const isManagerRole = role === USER_ROLE_MANAGER;
      const input = {
        username: username.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        dateOfBirth,
        gender,
        hometown: hometown.trim(),
        currentAddress: currentAddress.trim(),
        hometownProvinceCode: hometownProvinceCode || null,
        currentProvinceCode: currentProvinceCode || null,
        currentWardCode: currentWardCode || null,
        currentAddressLine: currentAddressLine.trim() || null,
        password: password.trim() || undefined,
        role,
        branchId: isManagerRole ? null : managerBranchId || branchId,
        managedBranchIds: isManagerRole ? managedBranchIds : [],
        identityCardFrontKey,
        identityCardBackKey,
      };

      if (staffId) {
        await updateStaff({ id: staffId, ...input });
        dispatchAppToast({ message: staffTexts.ownerStaff.toast.updated, type: "success" });
      } else {
        await createStaff(input);
        dispatchAppToast({ message: staffTexts.ownerStaff.toast.created, type: "success" });
      }
      router.push(listRoute);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : staffTexts.ownerStaff.errors.generic);
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 px-4 py-8 text-gray-1000 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <header className="flex items-center gap-3">
          <Button aria-label={staffTexts.ownerStaff.backToList} className="size-10 p-0" type="button" variant={UI_VARIANT_SECONDARY} onClick={() => router.push(listRoute)}>
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Button>
          <PageTitle>{isEdit ? staffTexts.ownerStaff.editTitle : staffTexts.ownerStaff.createTitle}</PageTitle>
        </header>

        {isEdit && isLoadingStaffMember ? (
          <StaffFormSkeleton />
        ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Card padding="lg" title={staffTexts.ownerStaff.personalSectionTitle}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2"><span className="text-sm font-medium">{staffTexts.ownerStaff.fullNameLabel} <span className="text-red-700">*</span></span><Input className="mt-2" required value={fullName} onChange={(e) => updateDraft({ fullName: e.target.value })} /></label>
              <label><span className="text-sm font-medium">{staffTexts.ownerStaff.phoneLabel} <span className="text-red-700">*</span></span><Input className="mt-2" required type="tel" value={phone} onChange={(e) => updateDraft({ phone: e.target.value })} /></label>
              <label><span className="text-sm font-medium">{staffTexts.ownerStaff.dateOfBirthLabel} <span className="text-red-700">*</span></span><Input className="mt-2" required type="date" value={dateOfBirth} onChange={(e) => updateDraft({ dateOfBirth: e.target.value })} /></label>
              <label><span className="text-sm font-medium">{staffTexts.ownerStaff.genderLabel} <span className="text-red-700">*</span></span><Select className="mt-2" required value={gender} onChange={(e) => updateDraft({ gender: e.target.value as StaffGenderValue })}><option disabled value="">{staffTexts.ownerStaff.genderPlaceholder}</option>{Object.entries(staffTexts.ownerStaff.genders).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></label>
              <StaffLocationFields
                currentAddressLine={currentAddressLine}
                currentProvinceCode={currentProvinceCode}
                currentWardCode={currentWardCode}
                hometownProvinceCode={hometownProvinceCode}
                isLoadingProvinces={isLoadingProvinces}
                isLoadingWards={isLoadingWards}
                locationError={Boolean(provincesError || wardsError)}
                provinces={provinces}
                wards={wards}
                onCurrentAddressLineChange={(value) =>
                  updateDraft({ currentAddressLine: value })
                }
                onCurrentProvinceChange={(value) =>
                  updateDraft({
                    currentProvinceCode: value,
                    currentWardCode: "",
                  })
                }
                onCurrentWardChange={(value) =>
                  updateDraft({ currentWardCode: value })
                }
                onHometownProvinceChange={(value) =>
                  updateDraft({ hometownProvinceCode: value })
                }
              />
            </div>
          </Card>

          <Card padding="lg" title={staffTexts.ownerStaff.identitySectionTitle}>
            <div className="grid gap-4 sm:grid-cols-2">
              <StaffIdentityImageField existingUrl={staffId && staffMember?.hasIdentityCardFront ? API_ROUTES.staffIdentityImage(staffId, "front") : undefined} label={staffTexts.ownerStaff.identityFrontLabel} onFileChange={(file) => { if (!validateIdentityFile(file)) return false; setFrontFile(file); return true; }} />
              <StaffIdentityImageField existingUrl={staffId && staffMember?.hasIdentityCardBack ? API_ROUTES.staffIdentityImage(staffId, "back") : undefined} label={staffTexts.ownerStaff.identityBackLabel} onFileChange={(file) => { if (!validateIdentityFile(file)) return false; setBackFile(file); return true; }} />
            </div>
          </Card>

          <Card padding="lg" title={staffTexts.ownerStaff.accountSectionTitle}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="text-sm font-medium">{staffTexts.ownerStaff.usernameLabel} <span className="text-red-700">*</span></span><Input className="mt-2" required value={username} onChange={(e) => updateDraft({ username: e.target.value })} /></label>
              <label><span className="text-sm font-medium">{staffTexts.ownerStaff.passwordLabel}{!isEdit ? <span className="text-red-700"> *</span> : null}</span><Input className="mt-2" minLength={isEdit ? undefined : 8} required={!isEdit} type="password" value={password} onChange={(e) => updateDraft({ password: e.target.value })} /></label>
              <label><span className="text-sm font-medium">{staffTexts.ownerStaff.roleLabel} <span className="text-red-700">*</span></span><Select className="mt-2" value={role} onChange={(e) => updateDraft({ role: e.target.value as StaffRole })}>{roleOptions.map((value) => <option key={value} value={value}>{staffTexts.ownerStaff.roles[value]}</option>)}</Select></label>
              {role === USER_ROLE_MANAGER ? <label><span className="text-sm font-medium">{staffTexts.ownerStaff.managedBranchesLabel} <span className="text-red-700">*</span></span><MultiSelect className="mt-2" options={activeBranches.map((branch) => ({ label: branch.name, value: branch.id }))} value={managedBranchIds} onChange={(value) => updateDraft({ managedBranchIds: value })} /></label> : <label><span className="text-sm font-medium">{staffTexts.ownerStaff.branchLabel} <span className="text-red-700">*</span></span><Select className="mt-2" disabled={isManagerMode} required value={managerBranchId || branchId} onChange={(e) => updateDraft({ branchId: e.target.value })}><option disabled value="">{staffTexts.ownerStaff.branchPlaceholder}</option>{activeBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</Select></label>}
            </div>
          </Card>

          {error ? <FeedbackError message={error} /> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant={UI_VARIANT_SECONDARY} onClick={() => router.push(listRoute)}>{staffTexts.ownerStaff.cancelEdit}</Button>
            <Button loading={isSubmitting} type="submit">{isEdit ? staffTexts.ownerStaff.submitUpdate : staffTexts.ownerStaff.submitCreate}</Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { staffTexts } from "@/constants/texts";
import type { Branch, Staff } from "@/types";

const mocks = vi.hoisted(() => ({
  createStaff: vi.fn(),
  deleteStaff: vi.fn(),
  updateStaff: vi.fn(),
  useBranches: vi.fn(),
  useStaff: vi.fn(),
}));

vi.mock("@/hooks/useBranches", () => ({
  useBranches: mocks.useBranches,
}));

vi.mock("@/hooks/useStaff", () => ({
  useStaff: mocks.useStaff,
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        branch_id: null,
      },
    },
  }),
}));

import OwnerStaffPage from "@/app/owner/staff/page";

const branch: Branch = {
  id: "branch-1",
  shopId: "shop-1",
  name: "Chi nhánh Quận 1",
  address: "123 Lê Lợi",
  createdAt: "2026-06-03T00:00:00.000Z",
};

const secondBranch: Branch = {
  ...branch,
  id: "branch-2",
  name: "Chi nhánh Quận 2",
};

const staffMember: Staff = {
  id: "staff-1",
  shopId: "shop-1",
  branchId: branch.id,
  username: "barber01",
  role: "barber",
  status: "active",
  isFirstLogin: true,
  createdAt: "2026-06-03T00:00:00.000Z",
  branch: {
    id: branch.id,
    name: branch.name,
  },
};

function mockStaffHooks(staff: Staff[] = []) {
  mocks.useStaff.mockReturnValue({
    staff,
    createStaff: mocks.createStaff,
    deleteStaff: mocks.deleteStaff,
    error: null,
    isCreating: false,
    isDeleting: false,
    isLoading: false,
    isUpdating: false,
    updateStaff: mocks.updateStaff,
  });
  mocks.useBranches.mockReturnValue({
    branches: [branch, secondBranch],
    error: null,
    isLoading: false,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

function getLastFieldByLabel(label: string) {
  const fields = screen.getAllByLabelText(label);
  const field = fields.at(-1);

  if (!field) {
    throw new Error(`Missing field: ${label}`);
  }

  return field;
}

describe("OwnerStaffPage", () => {
  it("should render empty state when there is no staff", () => {
    mockStaffHooks();

    render(<OwnerStaffPage />);

    expect(
      screen.getByRole("heading", {
        name: staffTexts.ownerStaff.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(staffTexts.ownerStaff.empty)).toBeInTheDocument();
  });

  it("should create staff from form input", async () => {
    const user = userEvent.setup();
    mockStaffHooks();
    mocks.createStaff.mockResolvedValue(staffMember);

    render(<OwnerStaffPage />);

    await user.click(
      screen.getByRole("button", {
        name: staffTexts.ownerStaff.createAction,
      }),
    );
    await user.type(
      screen.getByLabelText(staffTexts.ownerStaff.usernameLabel),
      staffMember.username,
    );
    await user.type(
      screen.getByLabelText(staffTexts.ownerStaff.passwordLabel),
      "Secret123!",
    );
    await user.selectOptions(
      getLastFieldByLabel(staffTexts.ownerStaff.roleLabel),
      staffMember.role,
    );
    await user.selectOptions(
      getLastFieldByLabel(staffTexts.ownerStaff.branchLabel),
      branch.id,
    );
    await user.click(
      screen.getByRole("button", {
        name: staffTexts.ownerStaff.submitCreate,
      }),
    );

    await waitFor(() => {
      expect(mocks.createStaff).toHaveBeenCalledWith({
        username: staffMember.username,
        password: "Secret123!",
        role: staffMember.role,
        branchId: branch.id,
        managedBranchIds: [],
      });
    });
  });

  it("should create manager with managed branches", async () => {
    const user = userEvent.setup();
    mockStaffHooks();
    mocks.createStaff.mockResolvedValue({
      ...staffMember,
      branchId: null,
      role: "manager",
      managedBranches: [{ id: branch.id, name: branch.name }],
    });

    render(<OwnerStaffPage />);

    await user.click(
      screen.getByRole("button", {
        name: staffTexts.ownerStaff.createAction,
      }),
    );
    await user.type(
      screen.getByLabelText(staffTexts.ownerStaff.usernameLabel),
      "manager01",
    );
    await user.type(
      screen.getByLabelText(staffTexts.ownerStaff.passwordLabel),
      "Secret123!",
    );
    await user.selectOptions(
      getLastFieldByLabel(staffTexts.ownerStaff.roleLabel),
      "manager",
    );
    await user.click(
      screen.getByText(staffTexts.ownerStaff.managedBranchesPlaceholder),
    );
    await user.click(screen.getByLabelText(branch.name));
    await user.click(
      screen.getByRole("button", {
        name: staffTexts.ownerStaff.submitCreate,
      }),
    );

    await waitFor(() => {
      expect(mocks.createStaff).toHaveBeenCalledWith({
        username: "manager01",
        password: "Secret123!",
        role: "manager",
        branchId: null,
        managedBranchIds: [branch.id],
      });
    });
  });

  it("should edit staff and reassign branch", async () => {
    const user = userEvent.setup();
    mockStaffHooks([staffMember]);
    mocks.updateStaff.mockResolvedValue({
      ...staffMember,
      branchId: secondBranch.id,
    });

    render(<OwnerStaffPage />);

    await user.click(
      screen.getByRole("button", {
        name: staffTexts.ownerStaff.edit,
      }),
    );
    await user.selectOptions(
      getLastFieldByLabel(staffTexts.ownerStaff.branchLabel),
      secondBranch.id,
    );
    await user.click(
      screen.getByRole("button", {
        name: staffTexts.ownerStaff.submitUpdate,
      }),
    );

    await waitFor(() => {
      expect(mocks.updateStaff).toHaveBeenCalledWith({
        id: staffMember.id,
        username: staffMember.username,
        password: undefined,
        role: staffMember.role,
        branchId: secondBranch.id,
        managedBranchIds: [],
      });
    });
  });

  it("should mark staff inactive after confirmation", async () => {
    const user = userEvent.setup();
    mockStaffHooks([staffMember]);
    mocks.deleteStaff.mockResolvedValue(staffMember);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<OwnerStaffPage />);

    await user.click(
      screen.getByRole("button", {
        name: staffTexts.ownerStaff.delete,
      }),
    );
    await user.click(
      screen.getAllByRole("button", {
        name: staffTexts.ownerStaff.delete,
      }).at(-1) as HTMLElement,
    );

    await waitFor(() => {
      expect(mocks.deleteStaff).toHaveBeenCalledWith(staffMember.id);
    });
  });
});

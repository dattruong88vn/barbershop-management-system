import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { branchTexts } from "@/constants/texts";
import type { Branch } from "@/types";

const mocks = vi.hoisted(() => ({
  createBranch: vi.fn(),
  deleteBranch: vi.fn(),
  updateBranch: vi.fn(),
  useBranches: vi.fn(),
}));

vi.mock("@/hooks/useBranches", () => ({
  useBranches: mocks.useBranches,
}));

import OwnerBranchesPage from "@/app/owner/branches/page";

const branch: Branch = {
  id: "branch-1",
  shopId: "shop-1",
  name: "Chi nhánh Quận 1",
  address: "123 Lê Lợi",
  createdAt: "2026-06-03T00:00:00.000Z",
};

function mockBranchHooks(branches: Branch[] = []) {
  mocks.useBranches.mockReturnValue({
    branches,
    createBranch: mocks.createBranch,
    deleteBranch: mocks.deleteBranch,
    error: null,
    isCreating: false,
    isDeleting: false,
    isLoading: false,
    isUpdating: false,
    updateBranch: mocks.updateBranch,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("OwnerBranchesPage", () => {
  it("should render empty state when there are no branches", () => {
    mockBranchHooks();

    render(<OwnerBranchesPage />);

    expect(
      screen.getByRole("heading", {
        name: branchTexts.ownerBranches.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(branchTexts.ownerBranches.empty)).toBeInTheDocument();
  });

  it("should create a branch from form input", async () => {
    const user = userEvent.setup();
    mockBranchHooks();
    mocks.createBranch.mockResolvedValue(branch);

    render(<OwnerBranchesPage />);

    await user.type(
      screen.getByLabelText(branchTexts.ownerBranches.nameLabel),
      branch.name,
    );
    await user.type(
      screen.getByLabelText(branchTexts.ownerBranches.addressLabel),
      branch.address,
    );
    await user.click(
      screen.getByRole("button", {
        name: branchTexts.ownerBranches.submitCreate,
      }),
    );

    await waitFor(() => {
      expect(mocks.createBranch).toHaveBeenCalledWith({
        name: branch.name,
        address: branch.address,
      });
    });
  });

  it("should edit an existing branch", async () => {
    const user = userEvent.setup();
    mockBranchHooks([branch]);
    mocks.updateBranch.mockResolvedValue({
      ...branch,
      name: "Chi nhánh Quận 3",
    });

    render(<OwnerBranchesPage />);

    await user.click(
      screen.getByRole("button", {
        name: branchTexts.ownerBranches.edit,
      }),
    );
    await user.clear(screen.getByLabelText(branchTexts.ownerBranches.nameLabel));
    await user.type(
      screen.getByLabelText(branchTexts.ownerBranches.nameLabel),
      "Chi nhánh Quận 3",
    );
    await user.click(
      screen.getByRole("button", {
        name: branchTexts.ownerBranches.submitUpdate,
      }),
    );

    await waitFor(() => {
      expect(mocks.updateBranch).toHaveBeenCalledWith({
        id: branch.id,
        name: "Chi nhánh Quận 3",
        address: branch.address,
      });
    });
  });

  it("should delete an existing branch after confirmation", async () => {
    const user = userEvent.setup();
    mockBranchHooks([branch]);
    mocks.deleteBranch.mockResolvedValue(branch);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<OwnerBranchesPage />);

    await user.click(
      screen.getByRole("button", {
        name: branchTexts.ownerBranches.delete,
      }),
    );

    await waitFor(() => {
      expect(mocks.deleteBranch).toHaveBeenCalledWith(branch.id);
    });
  });
});

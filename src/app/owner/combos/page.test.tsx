import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { comboTexts } from "@/constants/texts";
import type { Combo, Service } from "@/types";

const mocks = vi.hoisted(() => ({
  createCombo: vi.fn(),
  deleteCombo: vi.fn(),
  updateCombo: vi.fn(),
  useCombos: vi.fn(),
  useServices: vi.fn(),
}));

vi.mock("@/hooks/useCombos", () => ({
  useCombos: mocks.useCombos,
}));

vi.mock("@/hooks/useServices", () => ({
  useServices: mocks.useServices,
}));

import OwnerCombosPage from "@/app/owner/combos/page";

const service: Service = {
  id: "service-1",
  shopId: "shop-1",
  name: "Cắt tóc nam",
  price: 80000,
  isHaircut: true,
  createdAt: "2026-06-03T00:00:00.000Z",
};

const secondService: Service = {
  id: "service-2",
  shopId: "shop-1",
  name: "Gội đầu",
  price: 50000,
  isHaircut: false,
  createdAt: "2026-06-03T00:00:00.000Z",
};

const combo: Combo = {
  id: "combo-1",
  shopId: "shop-1",
  name: "Combo cắt gội",
  description: "Cắt tóc và gội đầu",
  price: 120000,
  services: [service],
  createdAt: "2026-06-03T00:00:00.000Z",
};

function mockComboHooks(combos: Combo[] = [], services: Service[] = [service]) {
  mocks.useCombos.mockReturnValue({
    combos,
    createCombo: mocks.createCombo,
    deleteCombo: mocks.deleteCombo,
    error: null,
    isCreating: false,
    isDeleting: false,
    isLoading: false,
    isUpdating: false,
    updateCombo: mocks.updateCombo,
  });
  mocks.useServices.mockReturnValue({
    services,
    error: null,
    isLoading: false,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

function submitCombosForm(buttonName: string) {
  const submitButton = screen.getByRole("button", {
    name: buttonName,
  });
  const form = submitButton.closest("form");

  expect(form).not.toBeNull();
  fireEvent.submit(form as HTMLFormElement);
}

describe("OwnerCombosPage", () => {
  it("should render empty state when there are no combos", () => {
    mockComboHooks();

    render(<OwnerCombosPage />);

    expect(
      screen.getByRole("heading", {
        name: comboTexts.ownerCombos.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(comboTexts.ownerCombos.empty)).toBeInTheDocument();
  });

  it("should create a combo from form input and selected services", async () => {
    const user = userEvent.setup();
    mockComboHooks();
    mocks.createCombo.mockResolvedValue(combo);

    render(<OwnerCombosPage />);

    await user.type(
      screen.getByLabelText(comboTexts.ownerCombos.nameLabel),
      combo.name,
    );
    await user.type(
      screen.getByLabelText(comboTexts.ownerCombos.descriptionLabel),
      combo.description,
    );
    await user.type(
      screen.getByLabelText(comboTexts.ownerCombos.priceLabel),
      String(combo.price),
    );
    await user.click(screen.getAllByRole("checkbox")[0]);
    submitCombosForm(comboTexts.ownerCombos.submitCreate);

    await waitFor(() => {
      expect(mocks.createCombo).toHaveBeenCalledWith({
        name: combo.name,
        description: combo.description,
        price: combo.price,
        serviceIds: [service.id],
      });
    });
  });

  it("should copy services from an existing combo before creating", async () => {
    const user = userEvent.setup();
    const copiedCombo = {
      ...combo,
      services: [secondService],
    };

    mockComboHooks([copiedCombo], [service, secondService]);
    mocks.createCombo.mockResolvedValue(copiedCombo);

    render(<OwnerCombosPage />);

    await user.selectOptions(
      screen.getByLabelText(comboTexts.ownerCombos.copyFromComboLabel),
      copiedCombo.id,
    );
    await user.type(
      screen.getByLabelText(comboTexts.ownerCombos.nameLabel),
      copiedCombo.name,
    );
    await user.type(
      screen.getByLabelText(comboTexts.ownerCombos.descriptionLabel),
      copiedCombo.description,
    );
    await user.type(
      screen.getByLabelText(comboTexts.ownerCombos.priceLabel),
      String(copiedCombo.price),
    );
    submitCombosForm(comboTexts.ownerCombos.submitCreate);

    await waitFor(() => {
      expect(mocks.createCombo).toHaveBeenCalledWith({
        name: copiedCombo.name,
        description: copiedCombo.description,
        price: copiedCombo.price,
        serviceIds: [secondService.id],
      });
    });
  });

  it("should edit an existing combo", async () => {
    const user = userEvent.setup();
    mockComboHooks([combo]);
    mocks.updateCombo.mockResolvedValue({
      ...combo,
      name: "Combo mới",
    });

    render(<OwnerCombosPage />);

    await user.click(
      screen.getByRole("button", {
        name: comboTexts.ownerCombos.edit,
      }),
    );
    await user.clear(screen.getByLabelText(comboTexts.ownerCombos.nameLabel));
    await user.type(
      screen.getByLabelText(comboTexts.ownerCombos.nameLabel),
      "Combo mới",
    );
    submitCombosForm(comboTexts.ownerCombos.submitUpdate);

    await waitFor(() => {
      expect(mocks.updateCombo).toHaveBeenCalledWith({
        id: combo.id,
        name: "Combo mới",
        description: combo.description,
        price: combo.price,
        serviceIds: [service.id],
      });
    });
  });

  it("should delete an existing combo after confirmation", async () => {
    const user = userEvent.setup();
    mockComboHooks([combo]);
    mocks.deleteCombo.mockResolvedValue(combo);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<OwnerCombosPage />);

    await user.click(
      screen.getByRole("button", {
        name: comboTexts.ownerCombos.delete,
      }),
    );

    await waitFor(() => {
      expect(mocks.deleteCombo).toHaveBeenCalledWith(combo.id);
    });
  });
});

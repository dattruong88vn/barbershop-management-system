import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { serviceTexts } from "@/constants/texts";
import type { Service } from "@/types";

const mocks = vi.hoisted(() => ({
  createService: vi.fn(),
  deleteService: vi.fn(),
  updateService: vi.fn(),
  useServices: vi.fn(),
}));

vi.mock("@/hooks/useServices", () => ({
  useServices: mocks.useServices,
}));

import OwnerServicesPage from "@/app/owner/services/page";

const service: Service = {
  id: "service-1",
  shopId: "shop-1",
  name: "Cắt tóc nam",
  price: 80000,
  isHaircut: true,
  createdAt: "2026-06-03T00:00:00.000Z",
};

function mockServiceHooks(services: Service[] = []) {
  mocks.useServices.mockReturnValue({
    services,
    createService: mocks.createService,
    deleteService: mocks.deleteService,
    error: null,
    isCreating: false,
    isDeleting: false,
    isLoading: false,
    isUpdating: false,
    updateService: mocks.updateService,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("OwnerServicesPage", () => {
  it("should render empty state when there are no services", () => {
    mockServiceHooks();

    render(<OwnerServicesPage />);

    expect(
      screen.getByRole("heading", {
        name: serviceTexts.ownerServices.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(serviceTexts.ownerServices.empty)).toBeInTheDocument();
  });

  it("should create a service from form input", async () => {
    const user = userEvent.setup();
    mockServiceHooks();
    mocks.createService.mockResolvedValue(service);

    render(<OwnerServicesPage />);

    await user.type(
      screen.getByLabelText(serviceTexts.ownerServices.nameLabel),
      service.name,
    );
    await user.type(
      screen.getByLabelText(serviceTexts.ownerServices.priceLabel),
      String(service.price),
    );
    await user.click(
      screen.getByLabelText(serviceTexts.ownerServices.isHaircutLabel),
    );
    await user.click(
      screen.getByRole("button", {
        name: serviceTexts.ownerServices.submitCreate,
      }),
    );

    await waitFor(() => {
      expect(mocks.createService).toHaveBeenCalledWith({
        name: service.name,
        price: service.price,
        isHaircut: true,
      });
    });
  });

  it("should edit an existing service", async () => {
    const user = userEvent.setup();
    mockServiceHooks([service]);
    mocks.updateService.mockResolvedValue({
      ...service,
      name: "Gội đầu",
      price: 50000,
      isHaircut: false,
    });

    render(<OwnerServicesPage />);

    await user.click(
      screen.getByRole("button", {
        name: serviceTexts.ownerServices.edit,
      }),
    );
    await user.clear(screen.getByLabelText(serviceTexts.ownerServices.nameLabel));
    await user.type(
      screen.getByLabelText(serviceTexts.ownerServices.nameLabel),
      "Gội đầu",
    );
    await user.clear(screen.getByLabelText(serviceTexts.ownerServices.priceLabel));
    await user.type(
      screen.getByLabelText(serviceTexts.ownerServices.priceLabel),
      "50000",
    );
    await user.click(
      screen.getByLabelText(serviceTexts.ownerServices.isHaircutLabel),
    );
    await user.click(
      screen.getByRole("button", {
        name: serviceTexts.ownerServices.submitUpdate,
      }),
    );

    await waitFor(() => {
      expect(mocks.updateService).toHaveBeenCalledWith({
        id: service.id,
        name: "Gội đầu",
        price: 50000,
        isHaircut: false,
      });
    });
  });

  it("should delete an existing service after confirmation", async () => {
    const user = userEvent.setup();
    mockServiceHooks([service]);
    mocks.deleteService.mockResolvedValue(service);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<OwnerServicesPage />);

    await user.click(
      screen.getByRole("button", {
        name: serviceTexts.ownerServices.delete,
      }),
    );

    await waitFor(() => {
      expect(mocks.deleteService).toHaveBeenCalledWith(service.id);
    });
  });
});

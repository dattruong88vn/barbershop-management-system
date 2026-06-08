import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  VisitCreateItemSelector,
  VisitCreateStaffSelect,
} from "./VisitCreateFormFields";

describe("VisitCreateItemSelector", () => {
  it("should render selectable items and call toggle callback", async () => {
    const user = userEvent.setup();
    const onToggleItem = vi.fn();

    render(
      <VisitCreateItemSelector
        emptyText="Không có dịch vụ"
        items={[
          {
            id: "service-1",
            name: "Cắt tóc nam",
            price: 100000,
          },
        ]}
        label="Dịch vụ"
        selectedIds={["service-1"]}
        onToggleItem={onToggleItem}
      />,
    );

    expect(screen.getByText("Dịch vụ")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();

    await user.click(screen.getByRole("checkbox"));

    expect(onToggleItem).toHaveBeenCalledWith("service-1");
  });

  it("should render empty text when there are no items", () => {
    render(
      <VisitCreateItemSelector
        emptyText="Không có combo"
        items={[]}
        label="Combo"
        selectedIds={[]}
        onToggleItem={() => undefined}
      />,
    );

    expect(screen.getByText("Không có combo")).toBeInTheDocument();
  });
});

describe("VisitCreateStaffSelect", () => {
  it("should render staff options and call change handler", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <VisitCreateStaffSelect
        label="Thợ cắt"
        noStaffOption="Chọn sau"
        staff={[
          {
            id: "barber-1",
            role: "barber",
            username: "barber01",
          },
        ]}
        value=""
        onChange={onChange}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Thợ cắt"), "barber-1");

    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole("option", { name: "barber01" })).toHaveValue(
      "barber-1",
    );
  });
});

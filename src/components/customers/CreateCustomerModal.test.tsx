import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FormEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { CreateCustomerModal } from "@/components/customers/CreateCustomerModal";
import { customerTexts } from "@/constants/texts";

describe("CreateCustomerModal", () => {
  it("should render form fields and submit", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <CreateCustomerModal
        error=""
        isCreating={false}
        name="Nguyễn Văn Nam"
        phone="0901234567"
        onClose={() => undefined}
        onNameChange={() => undefined}
        onPhoneChange={() => undefined}
        onSubmit={handleSubmit}
      />,
    );

    expect(
      screen.getByRole("heading", { name: customerTexts.lookup.createTitle }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(customerTexts.lookup.nameLabel)).toHaveValue(
      "Nguyễn Văn Nam",
    );
    expect(screen.getByLabelText(customerTexts.lookup.phoneLabel)).toHaveValue(
      "0901234567",
    );

    await user.click(
      screen.getByRole("button", { name: customerTexts.lookup.submitCreate }),
    );

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("should render error and close from buttons", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <CreateCustomerModal
        error="Số điện thoại không hợp lệ"
        isCreating={false}
        name=""
        phone=""
        onClose={handleClose}
        onNameChange={() => undefined}
        onPhoneChange={() => undefined}
        onSubmit={() => undefined}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Số điện thoại không hợp lệ",
    );

    await user.click(
      screen.getByRole("button", { name: customerTexts.lookup.modalClose }),
    );
    await user.click(
      screen.getByRole("button", { name: customerTexts.lookup.cancelCreate }),
    );

    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});

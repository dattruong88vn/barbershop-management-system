import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import { authTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  signIn: vi.fn(),
  useChangePassword: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("@/hooks/useChangePassword", () => ({
  useChangePassword: mocks.useChangePassword,
}));

vi.mock("next-auth/react", () => ({
  signIn: mocks.signIn,
}));

vi.mock("next/navigation", () => ({
  useRouter: mocks.useRouter,
}));

import ChangePasswordPage from "@/app/(auth)/change-password/page";

afterEach(() => {
  vi.clearAllMocks();
});

describe("ChangePasswordPage", () => {
  it("should show a validation error when passwords are missing", async () => {
    mocks.useRouter.mockReturnValue({
      replace: mocks.replace,
      refresh: mocks.refresh,
    });
    mocks.useChangePassword.mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: false,
    });

    render(<ChangePasswordPage />);

    const _submitButton = screen.getByRole("button", {
      name: authTexts.changePassword.submit,
    });
    const _form = _submitButton.closest("form");

    expect(_form).not.toBeNull();
    fireEvent.submit(_form as HTMLFormElement);

    expect(
      await screen.findByText(authTexts.changePassword.errors.missingPassword),
    ).toBeInTheDocument();
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it("should keep submit disabled when the form is invalid", async () => {
    mocks.useRouter.mockReturnValue({
      replace: mocks.replace,
      refresh: mocks.refresh,
    });
    mocks.useChangePassword.mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: false,
    });

    render(<ChangePasswordPage />);

    expect(
      screen.getByRole("button", { name: authTexts.changePassword.submit }),
    ).toBeDisabled();
  });

  it("should mark both password fields as required", async () => {
    mocks.useRouter.mockReturnValue({
      replace: mocks.replace,
      refresh: mocks.refresh,
    });
    mocks.useChangePassword.mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: false,
    });

    render(<ChangePasswordPage />);

    expect(
      screen.getByLabelText(authTexts.changePassword.newPasswordLabel),
    ).toBeRequired();
    expect(
      screen.getByLabelText(authTexts.changePassword.confirmPasswordLabel),
    ).toBeRequired();
    expect(screen.getAllByText("_")).toHaveLength(2);
  });

  it("should show loading state while submitting", () => {
    mocks.useRouter.mockReturnValue({
      replace: mocks.replace,
      refresh: mocks.refresh,
    });
    mocks.useChangePassword.mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: true,
    });

    render(<ChangePasswordPage />);

    expect(
      screen.getByRole("button", { name: authTexts.changePassword.submit }),
    ).toBeDisabled();
    expect(document.querySelector(".animate-spin")).not.toBeNull();
  });

  it("should show a validation error when passwords do not match", async () => {
    const _user = userEvent.setup();

    mocks.useRouter.mockReturnValue({
      replace: mocks.replace,
      refresh: mocks.refresh,
    });
    mocks.useChangePassword.mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: false,
    });

    render(<ChangePasswordPage />);

    await _user.type(
      screen.getByLabelText(authTexts.changePassword.newPasswordLabel),
      "Secret123!",
    );
    await _user.type(
      screen.getByLabelText(authTexts.changePassword.confirmPasswordLabel),
      "Secret456!",
    );

    expect(
      await screen.findByText(
        authTexts.changePassword.errors.passwordMismatch,
      ),
    ).toBeInTheDocument();
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it("should change the password and redirect after sign in succeeds", async () => {
    const _user = userEvent.setup();

    mocks.useRouter.mockReturnValue({
      replace: mocks.replace,
      refresh: mocks.refresh,
    });
    mocks.useChangePassword.mockReturnValue({
      mutateAsync: mocks.mutateAsync.mockResolvedValue({
        username: "dat",
        redirectTo: ROUTES.customers,
      }),
      isPending: false,
    });
    mocks.signIn.mockResolvedValue({ ok: true });

    render(<ChangePasswordPage />);

    await _user.type(
      screen.getByLabelText(authTexts.changePassword.newPasswordLabel),
      "Secret123!",
    );
    await _user.type(
      screen.getByLabelText(authTexts.changePassword.confirmPasswordLabel),
      "Secret123!",
    );
    await _user.click(
      screen.getByRole("button", { name: authTexts.changePassword.submit }),
    );

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        password: "Secret123!",
        confirmPassword: "Secret123!",
      });
      expect(mocks.signIn).toHaveBeenCalledWith("credentials", {
        username: "dat",
        password: "Secret123!",
        redirect: false,
      });
      expect(mocks.replace).toHaveBeenCalledWith(ROUTES.dashboard);
      expect(mocks.refresh).toHaveBeenCalled();
    });
  });

  it("should toggle password visibility", async () => {
    const _user = userEvent.setup();

    mocks.useRouter.mockReturnValue({
      replace: mocks.replace,
      refresh: mocks.refresh,
    });
    mocks.useChangePassword.mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: false,
    });

    render(<ChangePasswordPage />);

    const passwordInput = screen.getByLabelText(
      authTexts.changePassword.newPasswordLabel,
    );

    expect(passwordInput).toHaveAttribute("type", "password");

    await _user.click(
      screen.getAllByRole("button", {
        name: authTexts.changePassword.showPassword,
      })[0],
    );

    expect(passwordInput).toHaveAttribute("type", "text");

    await _user.click(
      screen.getAllByRole("button", {
        name: authTexts.changePassword.hidePassword,
      })[0],
    );

    expect(passwordInput).toHaveAttribute("type", "password");
  });
});

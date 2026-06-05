import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";
import { authTexts } from "@/constants/texts";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  signIn: vi.fn(),
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  signIn: mocks.signIn,
}));

vi.mock("next/navigation", () => ({
  useRouter: mocks.useRouter,
  useSearchParams: mocks.useSearchParams,
}));

import LoginPage from "@/app/(auth)/login/page";

function setupNavigation(callbackUrl: string | null = null) {
  mocks.useRouter.mockReturnValue({
    replace: mocks.replace,
    refresh: mocks.refresh,
  });
  mocks.useSearchParams.mockReturnValue({
    get: vi.fn((key: string) => (key === "callbackUrl" ? callbackUrl : null)),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("LoginPage", () => {
  it("should show a validation error when credentials are missing", async () => {
    const user = userEvent.setup();
    setupNavigation();

    render(<LoginPage />);

    await user.click(
      screen.getByRole("button", { name: authTexts.login.submit }),
    );

    expect(
      await screen.findByText(authTexts.login.errors.missingCredentials),
    ).toBeInTheDocument();
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it("should render login fields without a required password marker", () => {
    setupNavigation();

    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(authTexts.login.passwordLabel);

    expect(passwordInput).toBeInTheDocument();
    expect(screen.queryByText("_")).not.toBeInTheDocument();
  });

  it("should show an error when sign in fails", async () => {
    const user = userEvent.setup();
    setupNavigation();
    mocks.signIn.mockResolvedValue({ ok: false });

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText(authTexts.login.usernameLabel),
      "receptionist.demo",
    );
    await user.type(
      screen.getByLabelText(authTexts.login.passwordLabel),
      "wrong-password",
    );
    await user.click(
      screen.getByRole("button", { name: authTexts.login.submit }),
    );

    expect(
      await screen.findByText(authTexts.login.errors.invalidCredentials),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      authTexts.login.errors.invalidCredentials,
    );
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("should sign in and redirect to dashboard by default", async () => {
    const user = userEvent.setup();
    setupNavigation();
    mocks.signIn.mockResolvedValue({ ok: true });

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText(authTexts.login.usernameLabel),
      " receptionist.demo ",
    );
    await user.type(
      screen.getByLabelText(authTexts.login.passwordLabel),
      "password123",
    );
    await user.click(
      screen.getByRole("button", { name: authTexts.login.submit }),
    );

    await waitFor(() => {
      expect(mocks.signIn).toHaveBeenCalledWith("credentials", {
        username: "receptionist.demo",
        password: "password123",
        redirect: false,
      });
      expect(mocks.replace).toHaveBeenCalledWith(ROUTES.dashboard);
      expect(mocks.refresh).toHaveBeenCalled();
    });
  });

  it("should use callbackUrl when it is provided", async () => {
    const user = userEvent.setup();
    setupNavigation(ROUTES.customers);
    mocks.signIn.mockResolvedValue({ ok: true });

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText(authTexts.login.usernameLabel),
      "receptionist.demo",
    );
    await user.type(
      screen.getByLabelText(authTexts.login.passwordLabel),
      "password123",
    );
    await user.click(
      screen.getByRole("button", { name: authTexts.login.submit }),
    );

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith(ROUTES.customers);
    });
  });

  it("should toggle password visibility", async () => {
    const user = userEvent.setup();
    setupNavigation();

    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(authTexts.login.passwordLabel);

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(
      screen.getByRole("button", { name: authTexts.login.showPassword }),
    );

    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(
      screen.getByRole("button", { name: authTexts.login.hidePassword }),
    );

    expect(passwordInput).toHaveAttribute("type", "password");
  });
});

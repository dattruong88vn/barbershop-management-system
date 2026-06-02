import { useMutation } from "@tanstack/react-query";

import { authTexts } from "@/constants/texts";

type ChangePasswordInput = {
  password: string;
  confirmPassword: string;
};

export type ChangePasswordResult = {
  username: string;
  redirectTo: string;
};

type ChangePasswordApiResponse = Partial<ChangePasswordResult> & {
  error?: string;
};

function isChangePasswordResult(
  response: ChangePasswordApiResponse,
): response is ChangePasswordResult {
  return (
    typeof response.username === "string" &&
    typeof response.redirectTo === "string"
  );
}

async function changePassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  const response = await fetch("/api/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result = (await response.json()) as ChangePasswordApiResponse;

  if (!response.ok || !isChangePasswordResult(result)) {
    throw new Error(result.error ?? authTexts.changePassword.errors.generic);
  }

  return result;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

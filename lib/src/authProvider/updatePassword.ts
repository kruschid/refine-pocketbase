import type { AuthActionResponse } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { RequiredAuthOptions, TranslateFn } from ".";

interface UpdatePassword {
  token: string;
  password: string;
  translate?: TranslateFn;
}

export const updatePassword = (
  pb: PocketBase,
  options: RequiredAuthOptions,
) => async ({
  token,
  password,
  translate,
}: UpdatePassword): Promise<AuthActionResponse> => {
  await pb
    .collection(options.collection)
    .confirmPasswordReset(token, password, password);

  return {
    success: true,
    redirectTo: options.updatePasswordRedirectTo,
    successNotification: translate ? {
      message: translate(
        "authProvider.updatePassword.successMessage",
        "Password updated",
      ),
      description: translate(
        "authProvider.updatePassword.successDescription",
        "Your password has been changed successfully."
      ),
    } : undefined,
  };
}
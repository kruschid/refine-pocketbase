import type { AuthActionResponse } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { RequiredAuthOptions, TranslateFn } from ".";

export interface UpdatePasswordArgs {
  token: string;
  password: string;
  translate?: TranslateFn;
}

export const updatePassword =
  (pb: PocketBase, options: RequiredAuthOptions) =>
  async ({
    token,
    password,
    translate,
  }: UpdatePasswordArgs): Promise<AuthActionResponse> => {
    try {
      await pb
        .collection(options.collection)
        .confirmPasswordReset(token, password, password);

      return {
        success: true,
        redirectTo: options.updatePasswordRedirectTo,
        successNotification: translate
          ? {
              message: translate(
                "authProvider.updatePassword.successMessage",
                "Password updated",
              ),
              description: translate(
                "authProvider.updatePassword.successDescription",
                "Your password has been changed successfully.",
              ),
            }
          : undefined,
      };
    } catch {
      return {
        success: false,
        error: translate
          ? {
              statusCode: 400,
              name: translate(
                "authProvider.updatePassword.errorMessage",
                "Password update failed",
              ),
              message: translate(
                "authProvider.updatePassword.errorDescription",
                "Something went wrong while updating your password. Please try again later.",
              ),
            }
          : undefined,
      };
    }
  };

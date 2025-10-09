import type { AuthActionResponse } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { RequiredAuthOptions, TranslateFn } from ".";

export interface ForgotPasswordArgs {
  email: string;
  translate?: TranslateFn;
}

export const forgotPassword =
  (pb: PocketBase, options: RequiredAuthOptions) =>
  async ({
    email,
    translate,
  }: ForgotPasswordArgs): Promise<AuthActionResponse> => {
    try {
      await pb.collection(options.collection).requestPasswordReset(email);

      return {
        success: true,
        redirectTo: options.forgotPasswordRedirectTo,
        successNotification: translate
          ? {
              message: translate(
                "authProvider.forgotPassword.successMessage",
                "Password reset link sent",
              ),
              description: translate(
                "authProvider.forgotPassword.successDescription",
                "Check your email for instructions to reset your password.",
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
              message: translate(
                "authProvider.forgotPassword.errorMessage",
                "Password reset email not sent",
              ),
              description: translate(
                "authProvider.forgotPassword.errorDescription",
                "Something went wrong while sending the reset link. Please check your email address and try again.",
              ),
            }
          : undefined,
      };
    }
  };

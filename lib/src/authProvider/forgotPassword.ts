import type { AuthActionResponse } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { RequiredAuthOptions, TranslateFn } from ".";

export type ForgotPasswordArgs = ({
  email: string;
} | {
  username: string;
}) & {
  translate?: TranslateFn; 
}

export const forgotPassword = (
  pb: PocketBase,
  options: RequiredAuthOptions,
) => async (
  { translate, ...args }: ForgotPasswordArgs
): Promise<AuthActionResponse> => {
  const emailOrUsername = "email" in args ? args.email : args.username;
  
  try {
    await pb
      .collection(options.collection)
      .requestPasswordReset(emailOrUsername);
  
    return {
      success: true,
      redirectTo: options.forgotPasswordRedirectTo,
      successNotification: translate ? {
        message: translate(
          "authProvider.forgotPassword.successMessage",
          "Password reset link sent",
        ),
        description: translate(
          "authProvider.forgotPassword.successDescription",
          "Check your email for instructions to reset your password."
        ),
      } : undefined,
    };
  } catch {
    return {
      success: false,
    }
  }
};

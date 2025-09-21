import type { AuthActionResponse } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { RequiredAuthOptions, TranslateFn } from ".";

export interface RegisterOptions {
  email: string;
  password: string;
  username?: string;
  name?: string;
  requestVerification?: boolean;
  translate?: TranslateFn;
}

export const register = (
  pb: PocketBase,
  options: RequiredAuthOptions,
) => async ({
  email,
  password,
  username,
  name,
  translate,
}: RegisterOptions): Promise<AuthActionResponse> => {
  await pb.collection(options.collection).create({
    email,
    username,
    name,
    password,
    passwordConfirm: password,
  });

  if (options.requestVerification) {
    await pb
      .collection(options.collection)
      .requestVerification(email);
      
      return {
        success: true,
        redirectTo: options.registerRedirectTo,
        successNotification: translate ? {
          description: translate(
            "authProvider.register.requestVerificationDescription",
            "Account verification"
          ),
          message: translate(
            "authProvider.register.requestVerificationMessage",
            "Please verify your account by clicking the link we sent to your email address"
          ),
        } : undefined,
      }
  }
  return {
    success: true,
    redirectTo: options.registerRedirectTo,
    successNotification: translate ? {
      description: translate(
        "authProvider.register.completedDescription",
        "Registration completed",
      ),
      message: translate(
        "authProvider.register.completedMessage",
        "Please sign in using your credentials",
      ),
    } : undefined,
  };
};

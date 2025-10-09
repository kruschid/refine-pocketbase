import type { AuthActionResponse } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { RequiredAuthOptions, TranslateFn } from ".";

export interface RegisterArgs {
  email: string;
  password: string;
  username?: string;
  name?: string;
  requestVerification?: boolean;
  translate?: TranslateFn;
}

export const register =
  (pb: PocketBase, options: RequiredAuthOptions) =>
  async ({
    email,
    password,
    username,
    name,
    translate,
  }: RegisterArgs): Promise<AuthActionResponse> => {
    try {
      await pb.collection(options.collection).create({
        email,
        username,
        name,
        password,
        passwordConfirm: password,
      });

      if (options.requestVerification) {
        await pb.collection(options.collection).requestVerification(email);

        return {
          success: true,
          redirectTo: options.registerRedirectTo,
          successNotification: translate
            ? {
                message: translate(
                  "authProvider.register.requestVerificationMessage",
                  "Account verification",
                ),
                description: translate(
                  "authProvider.register.requestVerificationDescription",
                  "Please verify your account by clicking the link we sent to your email address",
                ),
              }
            : undefined,
        };
      }
      return {
        success: true,
        redirectTo: options.registerRedirectTo,
        successNotification: translate
          ? {
              message: translate(
                "authProvider.register.completedMessage",
                "Registration completed",
              ),
              description: translate(
                "authProvider.register.completedDescription",
                "Please sign in using your credentials",
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
                "authProvider.register.errorName",
                "Registration failed",
              ),
              message: translate(
                "authProvider.register.errorMessage",
                "Something went wrong while creating your account. Please try again.",
              ),
            }
          : undefined,
      };
    }
  };

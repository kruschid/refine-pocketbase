import { AuthBindings, UpdatePasswordFormTypes } from "@refinedev/core";
import type PocketBase from "pocketbase";
import { isClientResponseError, toHttpError } from "./utils";

export interface LoginWithProvider {
  providerName: string;
}
export interface LoginWithPassword {
  email: string;
  password: string;
  remember: boolean;
}

export type LoginOptions = LoginWithProvider | LoginWithPassword;

export interface AuthOptions {
  collection?: string;
  requestVerification?: boolean;
  registerRedirectTo?: string;
  registerErrorRedirectTo?: string;
  forgotPasswordRedirectTo?: string;
  forgotPasswordErrorRedirectTo?: string;
  updatePasswordRedirectTo?: string;
  updatePasswordErrorRedirectTo?: string;
  loginRedirectTo?: string;
  loginErrorRedirectTo?: string;
  logoutRedirectTo?: string;
  authenticatedRedirectTo?: string;
  unauthenticatedRedirectTo?: string;
}

type RequiredAuthOptions = Pick<
  Required<AuthOptions>,
  "collection" | "requestVerification"
>;

export type UpdatePasswordProps = UpdatePasswordFormTypes & { token: string };

const defaultOptions: RequiredAuthOptions = {
  collection: "users",
  requestVerification: false,
};

const isLoginWithProvider = (x: any): x is LoginWithProvider =>
  typeof x.providerName === "string";

export const authProvider = (
  pb: PocketBase,
  authOptions?: AuthOptions
): AuthBindings => {
  const options: RequiredAuthOptions & AuthOptions = {
    ...defaultOptions,
    ...authOptions,
  };

  return {
    register: async ({ email, password, username, name }) => {
      try {
        await pb.collection(options.collection).create(
          {
            email,
            username,
            name,
            password,
            passwordConfirm: password,
          },
          { requestKey: null }
        );

        if (options.requestVerification) {
          await pb
            .collection(options.collection)
            .requestVerification(email, { requestKey: null });
        }
        return {
          success: true,
          redirectTo: options.registerRedirectTo,
        };
      } catch (err) {
        return {
          success: false,
          error: isClientResponseError(err) ? toHttpError(err) : undefined,
          redirectTo: options.registerErrorRedirectTo,
        };
      }
    },
    forgotPassword: async ({ email }) => {
      try {
        await pb
          .collection(options.collection)
          .requestPasswordReset(email, { requestKey: null });

        return {
          success: true,
          redirectTo: options.forgotPasswordRedirectTo,
        };
      } catch (err) {
        return {
          success: false,
          error: isClientResponseError(err) ? toHttpError(err) : undefined,
          redirectTo: options.forgotPasswordErrorRedirectTo,
        };
      }
    },
    updatePassword: async ({ token, password, confirmPassword }) => {
      try {
        await pb
          .collection(options.collection)
          .confirmPasswordReset(token, password, confirmPassword, {
            requestKey: null,
          });

        return {
          success: true,
          redirectTo: options.updatePasswordRedirectTo,
        };
      } catch (err) {
        return {
          success: false,
          error: isClientResponseError(err) ? toHttpError(err) : undefined,
          redirectTo: options.updatePasswordErrorRedirectTo,
        };
      }
    },
    login: async (loginOptions: LoginOptions) => {
      try {
        if (isLoginWithProvider(loginOptions)) {
          await pb
            .collection(options.collection)
            .authWithOAuth2({ provider: loginOptions.providerName });
          if (pb.authStore.isValid) {
            return {
              success: true,
              redirectTo: options.loginRedirectTo,
            };
          }
        } else {
          await pb
            .collection(options.collection)
            .authWithPassword(loginOptions.email, loginOptions.password, {
              requestKey: null,
            });
          if (pb.authStore.isValid) {
            return {
              success: true,
              redirectTo: options.loginRedirectTo,
            };
          }
        }
      } catch (err) {
        return {
          success: false,
          error: isClientResponseError(err) ? toHttpError(err) : undefined,
          redirectTo: options.loginErrorRedirectTo,
        };
      }
      return {
        success: false,
        error: {
          name: "Login Error",
          message: "Invalid email or password",
        },
      };
    },
    logout: async () => {
      pb.authStore.clear();
      return {
        success: true,
        redirectTo: options.logoutRedirectTo,
      };
    },
    check: async () => {
      if (pb.authStore.isValid) {
        return {
          authenticated: true,
          redirectTo: options.authenticatedRedirectTo,
        };
      }

      return {
        authenticated: false,
        redirectTo: options.unauthenticatedRedirectTo,
      };
    },
    getPermissions: async () => null,
    getIdentity: async () => {
      if (pb.authStore.isValid && pb.authStore.model) {
        return pb.authStore.model; // id, name, avatar, ...
      }
      return null;
    },
    onError: async (error) => {
      return { error };
    },
  };
};

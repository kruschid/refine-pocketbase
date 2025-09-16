import type { AuthProvider as RefineAuthProvider, UpdatePasswordFormTypes } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { OAuth2AuthConfig, RecordOptions } from "pocketbase";
import { isClientResponseError, toHttpError } from "./utils";

export interface LoginWithProvider extends OAuth2AuthConfig {
  providerName?: string; // providerName prop is used by several AuthPage implementations
}

export interface LoginWithPassword {
  email: string;
  password: string;
  options?: RecordOptions;
}

export interface LoginWithOtp {
  otp: string;
}

export interface RequestOtpArgs {
  email: string;
  password?: string;
}

export type LoginOptions = LoginWithProvider | LoginWithOtp | LoginWithPassword;

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

export interface AuthProvider extends RefineAuthProvider {
  requestOtp?: (args: LoginWithPassword) => Promise<void>;
}

const defaultOptions: RequiredAuthOptions = {
  collection: "users",
  requestVerification: false,
};

const isLoginWithProvider = (x: unknown): x is LoginWithProvider =>
  typeof x === "object" &&
  x !== null &&
  "providerName" in x &&
  "provider" in x &&
  (typeof x.providerName === "string" || typeof x.provider === "string");

const isLoginWithOtp = (x: unknown): x is LoginWithOtp =>
  typeof x === "object" &&
  x !== null &&
  "otp" in x &&
  typeof x.otp === "string";

export const authProvider = (
  pb: PocketBase,
  authOptions?: AuthOptions
): AuthProvider => {
  const options: RequiredAuthOptions & AuthOptions = {
    ...defaultOptions,
    ...authOptions,
  };

  let otpId: string | undefined;
  let mfaId: string | undefined;

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
    requestOtp: async ({ email, password }: RequestOtpArgs) => {
      if(typeof password === "undefined") {
          otpId = (await pb.collection(options.collection).requestOTP(email)).otpId;
      } else {
        try {
          await pb.collection(options.collection).authWithPassword(email, password);
        }
        catch (err: any) {
          mfaId = err.response?.mfaId;
          if (!mfaId) {
            throw err;
          }
          otpId = (await pb.collection(options.collection).requestOTP(email)).otpId;
        }
      }
    },
    login: async (loginOptions: LoginOptions) => {
      try {
        if (isLoginWithProvider(loginOptions)) {
          await pb.collection(options.collection).authWithOAuth2({
            ...loginOptions,
            provider: loginOptions.providerName ?? loginOptions.provider,
          });
          if (pb.authStore.isValid) {
            return {
              success: true,
              redirectTo: options.loginRedirectTo,
            };
          }
        } else if (isLoginWithOtp(loginOptions)) {
          if (!otpId) {
            return {
              success: false,
              error: Error("otpId is undefined"),
            }
          }
          await pb.collection(options.collection).authWithOTP(otpId, loginOptions.otp, { mfaId });
          if (pb.authStore.isValid) { 
            otpId = undefined;
            mfaId = undefined;
            return {
              success: true,
              redirectTo: options.loginRedirectTo,
            };
          }
        } else {
          await pb
            .collection(options.collection)
            .authWithPassword(loginOptions.email, loginOptions.password, {
              ...loginOptions.options,
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
    getIdentity: async () => {
      if (pb.authStore.isValid && pb.authStore.record) {
        return pb.authStore.record; // id, name, avatar, ...
      }
      return null;
    },
    onError: async (error) => {
      return { error };
    },
  };
};

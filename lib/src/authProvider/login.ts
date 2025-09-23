import type { AuthActionResponse } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { OAuth2AuthConfig } from "pocketbase";
import { isClientResponseError } from "../utils";
import type { RequiredAuthOptions, TranslateFn } from ".";

export interface LoginWithProvider extends OAuth2AuthConfig {
  providerName?: string; // providerName prop is used by several AuthPage implementations
}

export type LoginWithCredentials = (
  | {
      email: string;
    }
  | {
      username: string;
    }
) & {
  password?: string;
};

export interface LoginWithOtp {
  otp: string;
  otpId: string;
  mfaId: string;
}

export type LoginQueryParams = Pick<LoginWithOtp, "mfaId" | "otpId">;

export type LoginArgs = (
  | LoginWithProvider
  | LoginWithOtp
  | LoginWithCredentials
) & {
  translate?: TranslateFn;
};

export const login = (
  pb: PocketBase,
  options: RequiredAuthOptions,
) => async ({
  translate,
  ...loginOptions
}: LoginArgs): Promise<AuthActionResponse> => {
  try {
    const successNotification = translate
      ? {
          message: translate(
            "authProvider.login.successMessage",
            "Login successful"
          ),
          description: translate(
            "authProvider.login.successDescription",
            "You're now signed in and ready to go."
          ),
        }
      : undefined;

    if (isLoginWithProvider(loginOptions)) {
      await pb.collection(options.collection).authWithOAuth2({
        ...loginOptions,
        provider: loginOptions.providerName ?? loginOptions.provider,
      });

      if (pb.authStore.isValid) {
        return {
          success: true,
          successNotification,
          redirectTo: options.loginRedirectTo,
        };
      }
    } else if (isLoginWithCredentials(loginOptions)) {
      const emailOrUsername =
        "email" in loginOptions ? loginOptions.email : loginOptions.username;

      // passwordless login with otp
      if (!loginOptions.password) {
        const { otpId } = await pb
          .collection(options.collection)
          .requestOTP(emailOrUsername);

        return {
          success: true,
          successNotification,
          redirectTo: options.loginRequestOtpRedirectTo
            ? `${options.loginRequestOtpRedirectTo}?otpId=${otpId}`
            : undefined,
        };
      }

      try {
        await pb
          .collection(options.collection)
          .authWithPassword(emailOrUsername, loginOptions.password);

        if (pb.authStore.isValid) {
          return {
            success: true,
            successNotification,
            redirectTo: options.loginRedirectTo,
          };
        }
      } catch (err: unknown) {
        if (!isClientResponseError(err)) {
          throw Error("Unknown error");
        }
        const mfaId: string | undefined = err.response.mfaId;

        if (mfaId) {
          const { otpId } = await pb
            .collection(options.collection)
            .requestOTP(emailOrUsername);
          return {
            success: true,
            successNotification,
            redirectTo: options.loginRequestOtpRedirectTo
              ? `${options.loginRequestOtpRedirectTo}?${loginQueryParams({otpId, mfaId})}` //otpId=..&mfaId=..`
              : undefined,
          };
        } else {
          throw Error("Invalid credentials");
        }
      }
    } else if (isLoginWithOtp(loginOptions)) {
      if (!loginOptions.otpId) {
        throw Error("otpId is undefined");
      }

      await pb
        .collection(options.collection)
        .authWithOTP(loginOptions.otpId, loginOptions.otp, {
          mfaId: loginOptions.mfaId,
        });

      if (pb.authStore.isValid) {
        return {
          success: true,
          successNotification,
          redirectTo: options.loginRedirectTo,
        };
      } else {
        throw Error("Invalid code");
      }
    }
  } catch {
    return {
      success: false,
      error: {
        name: translate
          ? translate("authProvider.login.errorName", "Something went wrong")
          : "Something went wrong",
        message: translate
          ? translate(
              "authProvider.login.errorMessage",
              "We couldn’t complete your request. Please refresh or try again later."
            )
          : "We couldn’t complete your request. Please refresh or try again later.",
        statusCode: 401,
      },
    };
  }

  return {
    success: false,
    error: {
      name: translate
        ? translate(
            "authProvider.login.unsupportedLoginName",
            "Unsupported login"
          )
        : "Unsupported login",
      message: translate
        ? translate(
            "authProvider.login.unsupportedLoginMessage",
            "This authentication method isn’t available. Try another way to sign in."
          )
        : "This authentication method isn’t available. Try another way to sign in.",
      statusCode: 400,
    },
  };
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

const isLoginWithCredentials = (x: unknown): x is LoginWithCredentials =>
  typeof x === "object" &&
  x !== null &&
  Object.keys(x).some((key) => ["email", "username", "password"].includes(key));

const loginQueryParams = (params: LoginQueryParams) =>
  Object
    .entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
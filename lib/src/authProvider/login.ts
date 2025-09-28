import type { AuthActionResponse } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { CommonOptions, OAuth2AuthConfig, RecordOptions } from "pocketbase";
import { isClientResponseError } from "../utils";
import type { RequiredAuthOptions, TranslateFn } from ".";

export interface LoginWithProvider extends OAuth2AuthConfig {
  providerName?: string; // providerName prop is used by several AuthPage implementations
}

export type LoginWithPassword = (
  | { email: string; }
  | { username: string; }
) & {
  password?: string;
  otpOptions?: CommonOptions;
  options?: RecordOptions;
};

export interface LoginWithOtp {
  otp: string;
  otpId: string;
  mfaId?: string;
  options?: CommonOptions;
}

export type LoginQueryParams = Pick<LoginWithOtp, "mfaId" | "otpId"> & {
  to?: string; // defined and used by refine useLogin
};

export type LoginArgs = (
  | LoginWithProvider
  | LoginWithOtp
  | LoginWithPassword
) & {
  translate?: TranslateFn;
  redirectTo?: string;
};

export const login = (
  pb: PocketBase,
  options: RequiredAuthOptions,
) => async ({
  translate,
  ...loginArgs
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

    
    if (isLoginWithProvider(loginArgs)) {
      await pb.collection(options.collection).authWithOAuth2({
        ...loginArgs,
        provider: loginArgs.providerName ?? loginArgs.provider,
      });

      if (pb.authStore.isValid) {
        return {
          success: true,
          successNotification,
          redirectTo: options.loginRedirectTo,
        };
      }
    } else if (isLoginWithOtp(loginArgs)) {
      if (!loginArgs.otpId) {
        options.debug?.("otpId is undefined");
        throw new Error("otpId is undefined");
      }

      await pb
        .collection(options.collection)
        .authWithOTP(loginArgs.otpId, loginArgs.otp, {
          ...loginArgs.options,
          mfaId: loginArgs.mfaId,
        });

      if (pb.authStore.isValid) {
        return {
          success: true,
          successNotification,
          redirectTo: options.loginRedirectTo,
        };
      } else {
        options.debug?.("invalid otp")
        throw Error("invalid otp");
      }
    } else if (isLoginWithPassword(loginArgs)) {
      const emailOrUsername =
        "email" in loginArgs ? loginArgs.email : loginArgs.username;

      // otp request for passwordless login 
      if (!loginArgs.password) {
        const { otpId } = await pb
          .collection(options.collection)
          .requestOTP(emailOrUsername, loginArgs.otpOptions);

        return {
          success: true,
          successNotification,
          redirectTo: options.otpRedirectTo
            ? `${options.otpRedirectTo}?otpId=${otpId}`
            : undefined,
        };
      }

      try {
        await pb
          .collection(options.collection)
          .authWithPassword(emailOrUsername, loginArgs.password, loginArgs.options);

        if (pb.authStore.isValid) {
          return {
            success: true,
            successNotification,
            redirectTo: options.loginRedirectTo,
          };
        }
      } catch (err: unknown) {
        if (!isClientResponseError(err)) {
          options.debug?.("unknown error", err)
          throw new Error("unknown error");
        }
        if( !options.otpRedirectTo ) {
          options.debug?.("loginOtpRedirectTo must be defined")
          throw Error("loginOtpRedirectTo must be defined");
        }
  
        const mfaId: string | undefined = err.response.mfaId;

        if (mfaId) {
          const { otpId } = await pb
            .collection(options.collection)
            .requestOTP(emailOrUsername, loginArgs.otpOptions);
          return {
            success: true,
            successNotification,
            redirectTo: withQueryParams(options.otpRedirectTo, {otpId, mfaId}),
          };
        } else {
          options.debug?.("invalid credentials")
          throw Error("invalid credentials");
        }
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

const isLoginWithPassword = (x: unknown): x is LoginWithPassword =>
  typeof x === "object" &&
  x !== null &&
  Object.keys(x).some((key) => ["email", "username", "password"].includes(key));

const withQueryParams = (path: string, params: LoginQueryParams) => {
  const url = new URL(
    typeof window !== "undefined"
      ? window.location.href
      : "https://localhost"
  );
  for(const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return `${path}${url.search}`;
}

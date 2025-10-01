import type { AuthActionResponse, SuccessNotificationResponse } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { CommonOptions, OAuth2AuthConfig, RecordOptions } from "pocketbase";
import type { RequiredAuthOptions, TranslateFn } from ".";
import type { OtpHandler } from "../hooks/useOtp";
import { isClientResponseError } from "../utils";

export interface LoginWithProvider extends OAuth2AuthConfig {
  providerName?: string; // providerName prop is used by several AuthPage implementations
  translate?: TranslateFn;
}

export interface LoginWithEmail {
  email: string;
  password?: string;
  otpHandler?: OtpHandler;
  otpOptions?: CommonOptions;
  options?: RecordOptions;
  translate?: TranslateFn;
};

export type LoginArgs =
  | LoginWithProvider
  | LoginWithEmail;

export const login = (
  pb: PocketBase,
  options: RequiredAuthOptions,
) => async ({
  translate,
  ...loginArgs
}: LoginArgs): Promise<AuthActionResponse> => {
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

  try {    
    if (isLoginWithProvider(loginArgs)) {
      return loginWithProvider(pb, loginArgs, options, successNotification);
    } else if (isLoginWithEmail(loginArgs)) {
      // passwordless login 
      if (!loginArgs.password) {
        return loginWithOtp(pb, loginArgs, options, successNotification);
      }
      return loginWithPassword(pb, loginArgs, options, successNotification);
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

const isLoginWithEmail = (x: unknown): x is LoginWithEmail =>
  typeof x === "object" &&
  x !== null &&
  "email" in x;

const loginWithProvider = async (
  pb: PocketBase,
  loginArgs: LoginWithProvider,
  options: RequiredAuthOptions,
  successNotification?: SuccessNotificationResponse,
): Promise<AuthActionResponse> => {
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
  } else {
    options.debug?.("login with provider failed")
    throw Error("login with provider failed");
  }
}

const loginWithOtp = async (
  pb: PocketBase,
  loginArgs: LoginWithEmail,
  options: RequiredAuthOptions,
  successNotification?: SuccessNotificationResponse,
): Promise<AuthActionResponse> => {
  const { otpId } = await pb
    .collection(options.collection)
    .requestOTP(loginArgs.email, loginArgs.otpOptions);

  if(!loginArgs.otpHandler) {
    throw Error("otpHook must be defined for passwordless login");
  }

  const otp = await loginArgs.otpHandler.request();

  await pb
    .collection(options.collection)
    .authWithOTP(otpId, otp, loginArgs.options);

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
}

const loginWithPassword = async (
  pb: PocketBase,
  loginArgs: LoginWithEmail,
  options: RequiredAuthOptions,
  successNotification?: SuccessNotificationResponse,
): Promise<AuthActionResponse> => {
  if(!loginArgs.password) {
    throw Error("password is requiered")
  }
  try {
    await pb
      .collection(options.collection)
      .authWithPassword(loginArgs.email, loginArgs.password, loginArgs.options);

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
    if( !loginArgs.otpHandler ) {
      options.debug?.("otpHook must be defined")
      throw Error("otpHook must be defined");
    }

    const mfaId: string | undefined = err.response.mfaId;

    if (mfaId) {
      const { otpId } = await pb
        .collection(options.collection)
        .requestOTP(loginArgs.email, loginArgs.otpOptions);
      
      const otp = await loginArgs.otpHandler?.request();

      await pb
        .collection(options.collection)
        .authWithOTP(otpId, otp, {
          ...loginArgs.options,
          mfaId,
        });

      if (pb.authStore.isValid) {
        return {
          success: true,
          successNotification,
          redirectTo: options.loginRedirectTo,
        };
      } else {
        options.debug?.("mfa failed")
        throw Error("mfa failed");
      }
    } else {
      options.debug?.("invalid credentials")
      throw Error("invalid credentials");
    }
  }
  throw Error("unknown error");
}

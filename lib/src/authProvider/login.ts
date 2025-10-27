import type {
  AuthActionResponse,
  SuccessNotificationResponse,
} from "@refinedev/core";
import type PocketBase from "pocketbase";
import type {
  CommonOptions,
  OAuth2AuthConfig,
  RecordOptions,
} from "pocketbase";
import type { OtpHandler } from "../hooks/useOtp";
import { isClientResponseError } from "../utils";
import type { RequiredAuthOptions, TranslateFn } from ".";

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
}

export type LoginArgs = LoginWithProvider | LoginWithEmail;

const OTP_HOOK_ERROR = "otpHook must be defined for passwordless login";

export const login =
  (pb: PocketBase, options: RequiredAuthOptions) =>
  async ({
    translate,
    ...loginArgs
  }: LoginArgs): Promise<AuthActionResponse> => {
    const successNotification = translate
      ? {
          message: translate(
            "authProvider.login.successMessage",
            "Login successful",
          ),
          description: translate(
            "authProvider.login.successDescription",
            "You're now signed in and ready to go.",
          ),
        }
      : undefined;

    try {
      if (isLoginWithProvider(loginArgs)) {
        return loginWithProvider(pb, loginArgs, options, successNotification);
      } else if (isLoginWithEmail(loginArgs)) {
        // passwordless login
        if (!loginArgs.password) {
          return loginWithOtp(
            pb,
            loginArgs,
            options,
            successNotification,
            translate,
          );
        }
        return loginWithPassword(
          pb,
          loginArgs,
          options,
          successNotification,
          translate,
        );
      }
    } catch (e: unknown) {
      if ((e as Error)?.message === OTP_HOOK_ERROR) {
        throw e;
      }
      return {
        success: false,
        error: translate
          ? {
              statusCode: 401,
              name: translate(
                "authProvider.login.errorName",
                "Something went wrong",
              ),
              message: translate(
                "authProvider.login.errorMessage",
                "We couldn’t complete your request. Please refresh or try again later.",
              ),
            }
          : undefined,
      };
    }

    return {
      success: false,
      error: translate
        ? {
            statusCode: 400,
            name: translate(
              "authProvider.login.unsupportedLoginName",
              "Unsupported login",
            ),
            message: translate(
              "authProvider.login.unsupportedLoginMessage",
              "This authentication method isn’t available. Try another way to sign in.",
            ),
          }
        : undefined,
    };
  };

const isLoginWithProvider = (x: unknown): x is LoginWithProvider =>
  typeof x === "object" &&
  x !== null &&
  "providerName" in x &&
  "provider" in x &&
  (typeof x.providerName === "string" || typeof x.provider === "string");

const isLoginWithEmail = (x: unknown): x is LoginWithEmail =>
  typeof x === "object" && x !== null && "email" in x;

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
    options.debug?.("login with provider failed");
    throw Error("login with provider failed");
  }
};

const loginWithOtp = async (
  pb: PocketBase,
  loginArgs: LoginWithEmail,
  options: RequiredAuthOptions,
  successNotification?: SuccessNotificationResponse,
  translate?: TranslateFn,
): Promise<AuthActionResponse> => {
  const { otpId } = await pb
    .collection(options.collection)
    .requestOTP(loginArgs.email, loginArgs.otpOptions);

  if (!loginArgs.otpHandler) {
    throw Error(OTP_HOOK_ERROR);
  }

  let otp: string;
  try {
    otp = await loginArgs.otpHandler.request();
  } catch {
    return {
      success: false,
      error: translate
        ? {
            name: translate(
              "authProvider.login.otpCanceled",
              "Verification canceled",
            ),
            message: translate(
              "authProvider.login.otpCanceledMessage",
              "You stopped entering the code. Try again when you’re ready.",
            ),
          }
        : undefined,
    };
  }

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
    return {
      success: false,
      error: translate
        ? {
            name: translate(
              "authProvider.login.otpInvalid",
              "Invalid verification code",
            ),
            message: translate(
              "authProvider.login.otpInvalidMessage",
              "The code you entered is invalid or has expired. Request a new one and try again.",
            ),
          }
        : undefined,
    };
  }
};

const loginWithPassword = async (
  pb: PocketBase,
  loginArgs: LoginWithEmail,
  options: RequiredAuthOptions,
  successNotification?: SuccessNotificationResponse,
  translate?: TranslateFn,
): Promise<AuthActionResponse> => {
  if (!loginArgs.password) {
    throw Error("password is requiered");
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
      options.debug?.("unknown error", err);
      throw new Error("unknown error");
    }

    const mfaId: string | undefined = err.response.mfaId;

    if (mfaId) {
      if (!loginArgs.otpHandler) {
        throw Error(OTP_HOOK_ERROR);
      }

      const { otpId } = await pb
        .collection(options.collection)
        .requestOTP(loginArgs.email, loginArgs.otpOptions);

      let otp: string;
      try {
        otp = await loginArgs.otpHandler.request();
      } catch {
        return {
          success: false,
          error: translate
            ? {
                name: translate(
                  "authProvider.login.otpCanceled",
                  "Verification canceled",
                ),
                message: translate(
                  "authProvider.login.otpCanceledMessage",
                  "You stopped entering the code. Try again when you’re ready.",
                ),
              }
            : undefined,
        };
      }

      await pb.collection(options.collection).authWithOTP(otpId, otp, {
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
        return {
          success: false,
          error: translate
            ? {
                statusCode: 400,
                name: translate(
                  "authProvider.login.mfaError",
                  "Verification failed",
                ),
                message: translate(
                  "authProvider.login.mfaErrorMessage",
                  "Multi-factor authentication was not completed successfully. Please try again.",
                ),
              }
            : undefined,
        };
      }
    } else {
      return {
        success: false,
        error: translate
          ? {
              statusCode: 400,
              name: translate(
                "authProvider.login.credentialsError",
                "Invalid credentials",
              ),
              message: translate(
                "authProvider.login.credentialsErrorMessage",
                "The email or password you entered is incorrect. Please try again.",
              ),
            }
          : undefined,
      };
    }
  }
  throw Error("something went wrong");
};

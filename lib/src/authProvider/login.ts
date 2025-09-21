import type { AuthActionResponse } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { OAuth2AuthConfig } from "pocketbase";
import { isClientResponseError } from "../utils";
import type { RequiredAuthOptions, TranslateFn } from ".";

export interface LoginWithProvider extends OAuth2AuthConfig {
  providerName?: string; // providerName prop is used by several AuthPage implementations
}

export type RequestOtp = {
  email: string;
} | {
  username: string;
}

export type LoginWithCredentials = {
  email: string;
  password: string;
} | {
  username: string;
  password: string;
}

export interface LoginWithOtp {
  otp: string;
  otpId: string;
  mfaId: string;
}

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
) => async (
  { translate, ...loginOptions }: LoginArgs
): Promise<AuthActionResponse> => {
  const successNotification = translate ? {
    message: translate("authProvider.login.successMessage", "Login successful"),
    description: translate("authProvider.login.successDescription", "You're now signed in and ready to go."),
  }: undefined;

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
  } else if(isRequestOtp(loginOptions)){
    const emailOrUsername = "email" in loginOptions ? loginOptions.email : loginOptions.username;

    const { otpId } = await pb
        .collection(options.collection)
        .requestOTP(emailOrUsername);
  
      return {
        success: true,
        successNotification,
        redirectTo: options.loginRequestOtpRedirectTo
          ? `${options.loginRequestOtpRedirectTo}?otpId=${otpId}`
          : undefined,
      }
  } else if(isLoginWithCredentials(loginOptions)) {
    const emailOrUsername = "email" in loginOptions ? loginOptions.email : loginOptions.username
  
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
    }
    catch (err: unknown) {
      if(!isClientResponseError(err)){
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
            ? `${options.loginRequestOtpRedirectTo}?otpId=${otpId}&mfaId=${mfaId}`
            : undefined,
        }
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
      .authWithOTP(
        loginOptions.otpId,
        loginOptions.otp,
        { mfaId: loginOptions.mfaId }
      );

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

  throw Error("Unknown auth method");
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
  x !== null && (
    Object
      .keys(x)
      .some(key =>
        ["email", "username", "password"].includes(key)
      )
  );

const isRequestOtp = (x: unknown): x is RequestOtp =>
  typeof x === "object" &&
  x !== null && (
    Object
      .keys(x)
      .some(key =>
        ["email", "username"].includes(key)
      )
  );
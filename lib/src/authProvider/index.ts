import type { AuthProvider, useTranslate } from "@refinedev/core";
import type PocketBase from "pocketbase";
import { isClientResponseError, toHttpError } from "../utils";
import { check } from "./check";
import { forgotPassword } from "./forgotPassword";
import { login } from "./login";
import { logout } from "./logout";
import { register } from "./register";
import { updatePassword } from "./updatePassword";

export type * from "./forgotPassword";
export type * from "./login";
export type * from "./register";
export type * from "./updatePassword";

export interface AuthOptions {
  collection?: string;
  requestVerification?: boolean;
  registerRedirectTo?: string;
  registerErrorRedirectTo?: string;
  forgotPasswordRedirectTo?: string;
  forgotPasswordErrorRedirectTo?: string;
  updatePasswordRedirectTo?: string;
  updatePasswordErrorRedirectTo?: string;
  loginRequestOtpRedirectTo?: string;
  loginRedirectTo?: string;
  loginErrorRedirectTo?: string;
  logoutRedirectTo?: string;
  authenticatedRedirectTo?: string;
  unauthenticatedRedirectTo?: string;
}

export type RequiredAuthOptions = AuthOptions & Pick<
  Required<AuthOptions>,
  "collection" | "requestVerification"
>;

export type TranslateFn = ReturnType<typeof useTranslate>;

const defaultOptions: RequiredAuthOptions = {
  collection: "users",
  requestVerification: false,
};

export const authProvider = (
  pb: PocketBase,
  authOptions?: AuthOptions
): AuthProvider => {
  const options: RequiredAuthOptions & AuthOptions = {
    ...defaultOptions,
    ...authOptions,
  };

  return {
    register: register(pb, options),
    login: login(pb, options),
    forgotPassword: forgotPassword(pb, options),
    updatePassword: updatePassword(pb, options),
    check: check(pb, options),
    logout: logout(pb, options),
    getIdentity: async () => 
      pb.authStore.isValid
        ? pb.authStore.record
        : null,
    onError: async (error) => ({
      error: isClientResponseError(error)
        ? toHttpError(error)
        : error, 
    }),
  }
}

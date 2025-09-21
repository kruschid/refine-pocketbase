import type { AuthActionResponse } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { RequiredAuthOptions } from ".";

export const logout = (
  pb: PocketBase,
  options: RequiredAuthOptions,
) => async (): Promise<AuthActionResponse> => {
  pb.authStore.clear();
  return {
    success: true,
    redirectTo: options.logoutRedirectTo,
  };
};

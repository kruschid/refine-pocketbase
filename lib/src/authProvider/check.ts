import type { CheckResponse } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { RequiredAuthOptions } from ".";

export const check = (
  pb: PocketBase,
  options: RequiredAuthOptions,
) => async (): Promise<CheckResponse> => {
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
};

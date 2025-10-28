import type { AuthProvider } from "@refinedev/core";
import type PocketBase from "pocketbase";
import type { RequiredAuthOptions } from ".";

export const getIdentity = (
  pb: PocketBase,
  options: RequiredAuthOptions,
): AuthProvider["getIdentity"] => async () => {
  if (pb.authStore.isValid && pb.authStore.record) {
    return {
      ...pb.authStore.record,
      avatar: pb.authStore.record.avatar
        ? pb.files.getURL(pb.authStore.record, pb.authStore.record.avatar, {
            thumb: options.identityAvatarThumb ?? "100x100"
          })
        : undefined,
    };
  }

  return null;
}
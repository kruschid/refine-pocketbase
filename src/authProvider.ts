import { AuthBindings } from "@refinedev/core";
import type PocketBase from "pocketbase";

export interface LoginWithProvider {
  providerName: string;
}
export interface LoginWithPassword {
  email: string;
  password: string;
  remember: boolean;
}

export type LoginOptions = LoginWithProvider | LoginWithPassword;

export interface AuthOptions {
  loginRedirectTo?: string;
  loginErrorRedirectTo?: string;
  logoutRedirectTo?: string;
  unauthenticatedRedirectTo?: string;
}

const defaultOptions: AuthOptions = {
  loginRedirectTo: "/",
  loginErrorRedirectTo: undefined,
  logoutRedirectTo: "/login",
  unauthenticatedRedirectTo: "/login",
};

const isLoginWithProvider = (x: any): x is LoginWithProvider =>
  typeof x.providerName === "string";

export const authProvider = (
  pb: PocketBase,
  authOptions?: AuthOptions
): AuthBindings => {
  const options = { ...defaultOptions, ...authOptions };
  return {
    login: async (loginOptions: LoginOptions) => {
      if (isLoginWithProvider(loginOptions)) {
        await pb
          .collection("users")
          .authWithOAuth2({ provider: loginOptions.providerName });
        if (pb.authStore.isValid) {
          return {
            success: true,
            redirectTo: options.loginRedirectTo,
          };
        }
      } else {
        await pb
          .collection("users")
          .authWithPassword(loginOptions.email, loginOptions.password);
        if (pb.authStore.isValid) {
          return {
            success: true,
            redirectTo: options.loginRedirectTo,
          };
        }
      }

      return {
        success: false,
        error: {
          name: "Login error",
          message: "Invalid credentials",
        },
        redirectTo: options.loginErrorRedirectTo,
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
        };
      }

      return {
        authenticated: false,
        redirectTo: options.unauthenticatedRedirectTo,
      };
    },
    getPermissions: async () => null,
    getIdentity: async () => {
      if (pb.authStore.isValid && pb.authStore.model) {
        const { id, name, avatar } = pb.authStore.model;
        return {
          id,
          name,
          avatar,
        };
      }
      return null;
    },
    onError: async (error) => {
      return { error };
    },
  };
};

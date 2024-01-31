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
  collection: string;
  requestVerification: boolean;
  registerRedirectTo?: string;
  registerErrorRedirectTo?: string;
  forgotPasswordRedirectTo?: string;
  forgotPasswordErrorRedirectTo?: string;
  updatePasswordRedirectTo?: string;
  updatePasswordErrorRedirectTo?: string;
  loginRedirectTo?: string;
  loginErrorRedirectTo?: string;
  logoutRedirectTo?: string;
  authenticatedRedirectTo?: string;
  unauthenticatedRedirectTo?: string;
}

const defaultOptions: AuthOptions = {
  collection: "users",
  requestVerification: false,
};

const isLoginWithProvider = (x: any): x is LoginWithProvider =>
  typeof x.providerName === "string";

export const authProvider = (
  pb: PocketBase,
  authOptions?: Partial<AuthOptions>
): AuthBindings => {
  const options: AuthOptions = { ...defaultOptions, ...authOptions };

  return {
    register: async ({ email, password }) => {
      try {
        await pb.collection(options.collection).create({
          email,
          password,
          passwordConfirm: password,
        });

        if (options.requestVerification) {
          await pb.collection(options.collection).requestVerification(email);
        }
        return {
          success: true,
          redirectTo: options.registerRedirectTo,
        };
      } catch (err) {
        return {
          success: false,
          redirectTo: options.registerErrorRedirectTo,
        };
      }
    },
    forgotPassword: async ({ email }) => {
      try {
        await pb.collection(options.collection).requestPasswordReset(email);

        return {
          success: true,
          redirectTo: options.forgotPasswordRedirectTo,
        };
      } catch (err) {
        return {
          success: false,
          redirectTo: options.forgotPasswordErrorRedirectTo,
        };
      }
    },
    updatePassword: async ({ token, password, confirmPassword }) => {
      try {
        await pb
          .collection(options.collection)
          .confirmPasswordReset(token, password, confirmPassword);

        return {
          success: true,
          redirectTo: options.updatePasswordRedirectTo,
        };
      } catch (err) {
        return {
          success: false,
          redirectTo: options.updatePasswordErrorRedirectTo,
        };
      }
    },
    login: async (loginOptions: LoginOptions) => {
      if (isLoginWithProvider(loginOptions)) {
        await pb
          .collection(options.collection)
          .authWithOAuth2({ provider: loginOptions.providerName });
        if (pb.authStore.isValid) {
          return {
            success: true,
            redirectTo: options.loginRedirectTo,
          };
        }
      } else {
        await pb
          .collection(options.collection)
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
          redirectTo: options.authenticatedRedirectTo,
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

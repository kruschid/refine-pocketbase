import { AuthBindings, DataProvider, LiveProvider } from "@refinedev/core";
import PocketBase from "pocketbase";
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
    collection?: string;
    requestVerification?: boolean;
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
export const authProvider: (pb: PocketBase, authOptions?: AuthOptions) => AuthBindings;
export const dataProvider: (pb: PocketBase) => Omit<Required<DataProvider>, "createMany" | "updateMany" | "deleteMany" | "custom" | "getMany">;
export const liveProvider: (pb: PocketBase) => LiveProvider;

//# sourceMappingURL=index.d.ts.map

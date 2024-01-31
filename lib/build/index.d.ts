import { AuthBindings, ConditionalFilter, CrudFilters, DataProvider, LiveProvider } from "@refinedev/core";
import PocketBase from "pocketbase";
export interface LoginWithProvider {
    providerName: string;
}
export interface LoginWithPassword {
    email: string;
    password: string;
    remember: boolean;
}
export const authProvider: (pb: PocketBase, options?: {
    loginRedirectTo: string;
    loginErrorRedirectTo: undefined;
    logoutRedirectTo: string;
    checkRedirectTo: string;
}) => AuthBindings;
export const dataProvider: (pb: PocketBase) => Omit<Required<DataProvider>, "createMany" | "updateMany" | "deleteMany" | "custom" | "getMany">;
export const extractFilterExpression: (filters: CrudFilters, joinOperator?: ConditionalFilter["operator"], pos?: number) => string;
export const extractFilterValues: (filters: CrudFilters, pos?: number) => Record<string, unknown>;
export const liveProvider: (pb: PocketBase) => LiveProvider;

//# sourceMappingURL=index.d.ts.map

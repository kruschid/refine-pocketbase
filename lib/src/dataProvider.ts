import {
  CreateResponse,
  DataProvider,
  GetListResponse,
  GetOneResponse,
  UpdateResponse,
} from "@refinedev/core";
import PocketBase from "pocketbase";
import {
  extractFilterExpression,
  extractFilterValues,
  isClientResponseError,
  toHttpError,
} from "./utils";

export const dataProvider = (
  pb: PocketBase
): Omit<
  Required<DataProvider>,
  "createMany" | "updateMany" | "deleteMany" | "custom" | "getMany"
> => ({
  getList: async ({ resource, pagination, filters, sorters }) => {
    const { current = 1, pageSize = 10, mode = "server" } = pagination ?? {};

    const sort = sorters
      ?.map((s) => `${s.order === "desc" ? "-" : ""}${s.field}`)
      .join(",");

    const filter = filters
      ? pb.filter(
          extractFilterExpression(filters),
          extractFilterValues(filters)
        )
      : undefined;

    const collection = pb.collection(resource);

    try {
      if (mode === "server") {
        const { items, totalItems } = await collection.getList(
          current,
          pageSize,
          {
            ...(sort ? { sort } : {}),
            ...(filter ? { filter } : {}),
            requestKey: null,
          }
        );

        return {
          data: items,
          total: totalItems,
        } as GetListResponse<any>;
      } else {
        const items = await collection.getFullList({
          sort,
          filter,
          requestKey: null,
        });

        return {
          data: items,
          total: items.length,
        } as GetListResponse<any>;
      }
    } catch (e: unknown) {
      if (isClientResponseError(e)) {
        throw toHttpError(e);
      }
      throw e;
    }
  },

  create: async ({ resource, variables }) => {
    try {
      const data = await pb
        .collection(resource)
        .create(variables as Record<string, unknown>, { requestKey: null });

      return { data } as CreateResponse<any>;
    } catch (e: unknown) {
      if (isClientResponseError(e)) {
        throw toHttpError(e);
      }
      throw e;
    }
  },

  update: async ({ resource, id, variables }) => {
    try {
      const data = await pb
        .collection(resource)
        .update(id as string, variables as Record<string, unknown>, {
          requestKey: null,
        });

      return { data } as UpdateResponse<any>;
    } catch (e: unknown) {
      if (isClientResponseError(e)) {
        throw toHttpError(e);
      }
      throw e;
    }
  },

  getOne: async ({ resource, id }) => {
    try {
      const data = await pb
        .collection(resource)
        .getOne(id as string, { requestKey: null });

      return { data } as GetOneResponse<any>;
    } catch (e: unknown) {
      if (isClientResponseError(e)) {
        throw toHttpError(e);
      }
      throw e;
    }
  },

  deleteOne: async ({ resource, id }) => {
    try {
      const deleted = await pb
        .collection(resource)
        .delete(id as string, { requestKey: null });

      return { data: deleted ? { id } : undefined } as any;
    } catch (e) {
      if (isClientResponseError(e)) {
        throw toHttpError(e);
      }
      throw e;
    }
  },

  getApiUrl: () => {
    return pb.baseUrl;
  },
});

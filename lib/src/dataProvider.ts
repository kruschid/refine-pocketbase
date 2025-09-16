import {
  CreateResponse,
  CustomResponse,
  DataProvider,
  GetListResponse,
  GetOneResponse,
  UpdateResponse,
} from "@refinedev/core";
import PocketBase, { RecordListOptions, SendOptions } from "pocketbase";
import { isClientResponseError, toHttpError } from "./utils";
import { transformFilter } from "./filters";

export const dataProvider = (
  pb: PocketBase
): Omit<
  Required<DataProvider>,
  "createMany" | "updateMany" | "deleteMany" | "getMany"
> => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const { currentPage = 1, pageSize = 10, mode = "server" } = pagination ?? {};

    const sort = sorters
      ?.map((s) => `${s.order === "desc" ? "-" : ""}${s.field}`)
      .join(",");

    const options: RecordListOptions = {
      requestKey: meta?.requestKey ?? null,
      ...(sort ? { sort } : {}),
      ...(filters ? { filter: transformFilter(filters) } : {}),
      ...(meta?.expand ? { expand: meta?.expand.join(",") } : {}),
      ...(meta?.fields ? { fields: meta?.fields?.join(",") } : {}),
    };

    const collection = pb.collection(resource);

    try {
      if (mode === "server") {
        const { items, totalItems } = await collection.getList(
          currentPage,
          pageSize,
          options
        );

        return {
          data: items,
          total: totalItems,
        } as GetListResponse<any>;
      } else {
        const items = await collection.getFullList(options);

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

  create: async ({ resource, variables, meta }) => {
    try {
      const data = await pb
        .collection(resource)
        .create(variables as Record<string, unknown>, {
          requestKey: meta?.requestKey ?? null,
        });

      return { data } as CreateResponse<any>;
    } catch (e: unknown) {
      if (isClientResponseError(e)) {
        throw toHttpError(e);
      }
      throw e;
    }
  },

  update: async ({ resource, id, variables, meta }) => {
    try {
      const data = await pb
        .collection(resource)
        .update(id as string, variables as Record<string, unknown>, {
          requestKey: meta?.requestKey ?? null,
        });

      return { data } as UpdateResponse<any>;
    } catch (e: unknown) {
      if (isClientResponseError(e)) {
        throw toHttpError(e);
      }
      throw e;
    }
  },

  getOne: async ({ resource, id, meta }) => {
    try {
      const data = await pb.collection(resource).getOne(id as string, {
        requestKey: meta?.requestKey ?? null,
        ...(meta?.expand ? { expand: meta?.expand.join(",") } : {}),
        ...(meta?.fields ? { fields: meta?.fields.join(",") } : {}),
      });

      return { data } as GetOneResponse<any>;
    } catch (e: unknown) {
      if (isClientResponseError(e)) {
        throw toHttpError(e);
      }
      throw e;
    }
  },

  deleteOne: async ({ resource, id, meta }) => {
    try {
      const deleted = await pb
        .collection(resource)
        .delete(id as string, { requestKey: meta?.requestKey ?? null });

      return { data: deleted ? { id } : undefined } as any;
    } catch (e) {
      if (isClientResponseError(e)) {
        throw toHttpError(e);
      }
      throw e;
    }
  },

  getApiUrl: () => {
    return pb.baseURL;
  },
  custom: async ({ url, method, payload, query, headers }) => {
    try {
      const options: SendOptions = {
        method: method,
        headers: headers,
        body: payload,
        query: query as Record<string, any>,
      };
      const response = await pb.send(new URL(url).pathname, options);
      return {
        data: response,
      } as CustomResponse<any>;
    } catch (e: unknown) {
      if (isClientResponseError(e)) {
        throw toHttpError(e);
      }
      throw e;
    }
  },
});

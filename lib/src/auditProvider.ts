import { AuditLogProvider } from "@refinedev/core";
import PocketBase from "pocketbase";

export interface AutitLogOptions {
  collection?: string;
}

const defaultOptions: Required<AutitLogOptions> = {
  collection: "auditLogs", // pb naming styles: https://github.com/pocketbase/pocketbase/discussions/3254
};

export const auditLogProvider = (
  pb: PocketBase,
  auditLogsOptions: AutitLogOptions
): AuditLogProvider => {
  const options = {
    ...defaultOptions,
    ...auditLogsOptions,
  };

  return {
    create: async (params) => {
      const { resource, meta, action, author, data, previousData } = params;

      console.log(resource); // "produts", "posts", etc.
      console.log(meta); // { id: "1" }, { id: "2" }, etc.
      console.log(action); // "create", "update", "delete"
      // author object is `useGetIdentity` hook's return value.
      console.log(author); // { id: "1", name: "John Doe" }
      console.log(data); // { name: "Product 1", price: 100 }
      console.log(previousData); // { name: "Product 1", price: 50 }

      await pb.collection(options.collection).create(
        {
          data,
          previousData,
          author: author?.id,
          action,
          resource,
        },
        {
          requestKey: meta?.requestKey ?? null,
        }
      );

      return { success: true };
    },
    get: async ({ resource, meta, action, author }) => {
      const filters = [
        `resource = {:resource}`,
        ...(meta?.id ? `resourceId = {:resourceId}` : []),
        ...(action ? `action = {:action}` : []),
        ...(author?.id ? `author = {:author}` : []),
      ].join(" && ");

      return pb.collection(options.collection).getFullList({
        requestKey: meta?.requestKey ?? null,
        perPage: meta?.perPage,
        page: meta?.page,
        fields: meta?.fields?.join(","),
        filter: pb.filter(filters, {
          resource,
          resourceId: meta?.id,
          action,
          author: author?.id,
        }),
      });
    },
    update: async (params) => {},
  };
};

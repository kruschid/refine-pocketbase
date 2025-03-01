import { HttpError } from "@refinedev/core";
import { ClientResponseError } from "pocketbase";

export const isClientResponseError = (x: any): x is ClientResponseError =>
  typeof x.response === "object" &&
  typeof x.response.data === "object" &&
  typeof x.isAbort === "boolean" &&
  typeof x.url === "string" &&
  typeof x.status === "number";

export const toHttpError = (e: ClientResponseError): HttpError => ({
  message: e.message,
  statusCode: e.status,
  errors: Object.keys(e.response.data).reduce(
    (acc, next) => ({
      ...acc,
      [next]: (e as ClientResponseError).response.data[next].message,
    }),
    {}
  ),
});

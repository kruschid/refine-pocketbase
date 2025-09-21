import type { HttpError, ValidationErrors } from "@refinedev/core";
import type { ClientResponseError } from "pocketbase";

export const isClientResponseError = (x: unknown): x is ClientResponseError =>
  typeof x === "object" &&
  x !== null &&
  "response" in x &&
  typeof x.response === "object" &&
  x.response !== null &&
  "data" in x.response &&
  typeof x.response.data === "object" &&
  "isAbort" in x &&
  typeof x.isAbort === "boolean" &&
  "url" in x &&
  typeof x.url === "string" &&
  "status" in x &&
  typeof x.status === "number";

export const toHttpError = (e: ClientResponseError): HttpError => ({
  message: e.message,
  statusCode: e.status,
  errors: Object
    .keys(e.response.data)
    .reduce<ValidationErrors>((acc, next) => {
      acc[next] = e.response.data[next].message;
      return acc;
    }, {}),
});

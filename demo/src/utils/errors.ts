import { HttpError } from "@refinedev/core";

export const isHttpError = (x: any): x is HttpError =>
  x != null &&
  typeof x.message === "string" &&
  typeof x.statusCode === "number" &&
  typeof x.errors === "object" &&
  x.errors !== null &&
  !Array.isArray(x.errors);

export const getHttpErrorField = (
  { errors }: HttpError,
  fieldName: string
): string | undefined => {
  const field = errors?.[fieldName];
  return typeof field === "string" ? field : undefined;
};

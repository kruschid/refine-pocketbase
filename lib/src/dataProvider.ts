import {
  ConditionalFilter,
  CrudFilter,
  CrudFilters,
  DataProvider,
  HttpError,
} from "@refinedev/core";
import PocketBase, { ClientResponseError } from "pocketbase";

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

    if (mode === "server") {
      const { items, totalItems } = await collection.getList(
        current,
        pageSize,
        { sort, filter }
      );

      return {
        data: items as any,
        total: totalItems,
      };
    } else {
      const items = await collection.getFullList({ sort, filter });

      return {
        data: items,
        total: items.length,
      };
    }
  },

  create: async ({ resource, variables }) => {
    try {
      const data = await pb
        .collection(resource)
        .create(variables as Record<string, unknown>, { requestKey: null });

      return { data } as any;
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
        .update(id as string, variables as Record<string, any>);

      return { data } as any;
    } catch (e: unknown) {
      if (isClientResponseError(e)) {
        throw toHttpError(e);
      }
      throw e;
    }
  },

  getOne: async ({ resource, id }) => {
    const data = await pb.collection(resource).getOne(id as string);

    return { data } as any;
  },

  deleteOne: async ({ resource, id }) => {
    const deleted = await pb.collection(resource).delete(id as string);

    return { data: deleted ? { id } : undefined } as any;
  },

  getApiUrl: () => {
    return pb.baseUrl;
  },
});

const OPERATOR_MAP = {
  eq: "=",
  ne: "!=",
  lt: "<",
  gt: ">",
  lte: "<=",
  gte: ">=",
  in: "?=",
  nin: "?!=",
  contains: "~",
  ncontains: "!~",
  containss: "~",
  ncontainss: "!~",
  between: "",
  nbetween: "",
  null: "=",
  nnull: "!=",
  startswith: "~",
  nstartswith: "!~",
  startswiths: "~",
  nstartswiths: "!~",
  endswith: "~",
  nendswith: "!~",
  endswiths: "~",
  nendswiths: "!~",
  or: "||",
  and: "&&",
};

const isClientResponseError = (x: any): x is ClientResponseError =>
  typeof x.response === "object";

const toHttpError = (e: ClientResponseError): HttpError => ({
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

const isConditionalFilter = (filter: CrudFilter): filter is ConditionalFilter =>
  filter.operator === "and" || filter.operator === "or";

export const extractFilterExpression = (
  filters: CrudFilters,
  joinOperator: ConditionalFilter["operator"] = "and",
  pos = 0
) =>
  filters
    .map((filter, i): string =>
      isConditionalFilter(filter)
        ? `(${extractFilterExpression(filter.value, filter.operator, i)})`
        : `${filter.field} ${OPERATOR_MAP[filter.operator]} {:${
            filter.field
          }${pos}${i}}`
    )
    .join(` ${OPERATOR_MAP[joinOperator]} `);

export const extractFilterValues = (
  filters: CrudFilters,
  pos = 0
): Record<string, unknown> =>
  filters.reduce(
    (acc, filter, i) => ({
      ...acc,
      ...(isConditionalFilter(filter)
        ? extractFilterValues(filter.value, i)
        : { [filter.field + pos + i]: filter.value }),
    }),
    {}
  );

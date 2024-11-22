import {
  ConditionalFilter,
  CrudFilter,
  CrudFilters,
  HttpError,
  LogicalFilter
} from "@refinedev/core";
import { ClientResponseError } from "pocketbase";

type Suffixer = ReturnType<typeof createSuffixer>;
type FilterExpressionTransofrmer = (filter: LogicalFilter, counter: Suffixer) => string;
type FilterValueTransformer = (filter: LogicalFilter, counter: Suffixer) => Record<string, string>;
type FilterTransformers = [FilterExpressionTransofrmer, FilterValueTransformer];

const createSuffixer = () => {
  let i = 0;
  return (field: string) => `${field}${String(i++)}`;
}

const transformer = (op: string): FilterTransformers => [
  ({field}, withSuffix) => `${field} ${op} {:${withSuffix(field)}`,
  ({field, value}, withSuffix) => ({
    [`${withSuffix(field)}`]: value,
  })
];

const LOGICAL_OPERATORS: Record<LogicalFilter["operator"], FilterTransformers | undefined> = {
  eq: transformer("="),
  ne: transformer("!="),
  lt: transformer("<"),
  gt: transformer(">"),
  lte: transformer("<="),
  gte: transformer(">="),
  in: [
    (filter, withSuffix) => filter.value.map(() => `${filter.field} = {:${withSuffix(filter.field)}}`).join(" || "),
    (filter, withSuffix) => filter.value.reduce((acc: Record<string, string>, val: string) => ({
      ...acc,
      [`${withSuffix(filter.field)}`]: val,
    }), {})
  ],
  nin: [
    (filter, withSuffix) => filter.value.map(() => `${filter.field} != {:${withSuffix(filter.field)}}`).join(" && "),
    (filter, withSuffix) => filter.value.reduce((acc: Record<string, string>, val: string) => ({
      ...acc,
      [`${withSuffix(filter.field)}`]: val,
    }), {})
  ],
  ina: undefined,
  nina: undefined,
  contains: transformer("~"),
  ncontains: transformer("!~"),
  containss: transformer("~"),
  ncontainss: transformer("!~"),
  between: [
    ({field}, withSuffix) => `${field} > {:${withSuffix(field)}} && ${field} < {:${withSuffix(field)}}`,
    ({field, value: [min, max]}, withSuffix) => ({
      [`${withSuffix(field)}`]: min,
      [`${withSuffix(field)}`]: max,
    }),
  ],
  nbetween: [
    ({field}, withSuffix) => `${field} < {:${withSuffix(field)}} || ${field} > {:${withSuffix(field)}}`,
    ({field, value: [min, max]}, withSuffix) => ({
      [`${withSuffix(field)}`]: min,
      [`${withSuffix(field)}`]: max,
    }),
  ],
  null: undefined,
  nnull: undefined,
  startswith: [
    ({field}, withSuffix) => `${field} ~ {:${withSuffix(field)}}`,
    ({field, value}, withSuffix) => ({
      [`${withSuffix(field)}`]: `${value}%`
    })
  ],
  nstartswith: [
    ({field}, withSuffix) => `${field} !~ {:${withSuffix(field)}}`,
    ({field, value}, withSuffix) => ({
      [`${withSuffix(field)}`]: `${value}%`
    })
  ],
  startswiths: undefined,
  nstartswiths: undefined,
  endswith: [
    ({field}, withSuffix) => `${field} ~ {:${withSuffix(field)}}`,
    ({field, value}, withSuffix) => ({
      [`${withSuffix(field)}`]: `%${value}`
    })
  ],
  nendswith: undefined,
  endswiths: undefined,
  nendswiths: undefined,
}

const CONDITIONAL_OPERATORS: Record<ConditionalFilter["operator"], string> = {
  and: "&&",
  or: "||"
}

const getTransformer = (filter: LogicalFilter) => {
  const [transformExpression, transformValues] = LOGICAL_OPERATORS[filter.operator] ?? [];

  if (!transformExpression || !transformValues) {
    throw Error(`operator "${filter.operator}" is not supported by refine-pocketbase`);
  }
  return {
    transformExpression,
    transformValues,
  } 
};

export const isClientResponseError = (x: any): x is ClientResponseError =>
  typeof x.response === "object" &&
  typeof x.isAbort === "boolean" &&
  typeof x.url === "string" &&
  typeof x.status === "number";

export const toHttpError = (e: ClientResponseError): HttpError => ({
  message: e.message,
  statusCode: e.status,
  errors: Object.keys(e.response.data).reduce(
    (acc, withSuffix) => ({
      ...acc,
      [withSuffix]: (e as ClientResponseError).response.data[withSuffix].message,
    }),
    {}
  ),
});

const isConditionalFilter = (filter: CrudFilter): filter is ConditionalFilter =>
  filter.operator === "and" || filter.operator === "or";

export const extractFilterExpression = (
  filters: CrudFilters,
  joinOperator: ConditionalFilter["operator"] = "and",
  withSuffix = createSuffixer()
) =>
  filters
    .map((filter): string =>
      isConditionalFilter(filter)
        ? `(${extractFilterExpression(filter.value, filter.operator, withSuffix)})`
        : getTransformer(filter).transformExpression(filter, withSuffix)
    )
    .join(` ${CONDITIONAL_OPERATORS[joinOperator]} `);

export const extractFilterValues = (
  filters: CrudFilters,
  withSuffix = createSuffixer()
): Record<string, unknown> =>
  filters.reduce(
    (acc, filter) => ({
      ...acc,
      ...(isConditionalFilter(filter)
        ? extractFilterValues(filter.value, withSuffix)
        : getTransformer(filter).transformValues(filter, withSuffix)),
    }),
    {}
  );

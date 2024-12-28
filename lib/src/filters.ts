import {
  ConditionalFilter,
  CrudFilter,
  CrudFilters,
  LogicalFilter,
} from "@refinedev/core";

export type FilterValue = string | number | boolean | Date | null | object;

type TypedLogicalFilter<T = FilterValue> = Omit<LogicalFilter, "value"> & {
  value: T;
};

type ExpressionFn = (filter: TypedLogicalFilter<any>) => string | undefined;

export const serialize = (value: FilterValue) => {
  // https://github.com/pocketbase/js-sdk/blob/848b77d467b093c6bfbb19799e54af3b7909222e/src/Client.ts#L271
  if (
    typeof value === "boolean" ||
    typeof value === "number" ||
    value === null
  ) {
    return String(value);
  } else if (typeof value === "string") {
    return `'${value.replace(/'/g, "\\'")}'`;
  } else if (value instanceof Date) {
    return `'${value.toISOString().replace("T", " ")}'`;
  } else {
    return `'${JSON.stringify(value).replace(/'/g, "\\'")}'`;
  }
};

const escapeWildcards = (value: string) => value.replace(/\%/g, "\\%");

const defaultExpression = (operator?: string) => (filter: TypedLogicalFilter) =>
  `${filter.field} ${operator} ${serialize(filter.value)}`;

const logicalOperators: Record<
  LogicalFilter["operator"],
  ExpressionFn | undefined
> = {
  eq: defaultExpression("="),
  ne: defaultExpression("!="),
  lt: defaultExpression("<"),
  gt: defaultExpression(">"),
  lte: defaultExpression("<="),
  gte: defaultExpression(">="),
  in: (filter: TypedLogicalFilter<FilterValue[]>) =>
    filter.value
      .map((value) => `${filter.field} = ${serialize(value)}`)
      .join(" || "),
  nin: (filter: TypedLogicalFilter<FilterValue[]>) =>
    filter.value
      .map((value) => `${filter.field} != ${serialize(value)}`)
      .join(" && "),
  ina: undefined,
  nina: undefined,
  contains: defaultExpression("~"),
  ncontains: defaultExpression("!~"),
  containss: undefined,
  ncontainss: undefined,
  between: ({
    field,
    value,
  }: TypedLogicalFilter<[FilterValue, FilterValue]>) => {
    const op = [">=", "<="];
    return value
      .slice(0, 2)
      .flatMap((val, i) =>
        val != null ? `${field} ${op[i]} ${serialize(val)}` : []
      )
      .join(" && ");
  },
  nbetween: ({
    field,
    value,
  }: TypedLogicalFilter<[FilterValue, FilterValue]>) => {
    const op = ["<", ">"];
    return value
      .slice(0, 2)
      .flatMap((val, i) =>
        val != null ? `${field} ${op[i]} ${serialize(val)}` : []
      )
      .join(" || ");
  },
  null: ({ field, value }: TypedLogicalFilter<boolean>) =>
    value === true ? `${field} = null` : `${field} != null`,
  nnull: ({ field, value }: TypedLogicalFilter<boolean>) =>
    value === true ? `${field} != null` : `${field} = null`,
  startswith: ({ field, value }: TypedLogicalFilter<string>) =>
    `${field} ~ ${serialize(escapeWildcards(value) + "%")}`,
  nstartswith: ({ field, value }: TypedLogicalFilter<string>) =>
    `${field} !~ ${serialize(escapeWildcards(value) + "%")}`,
  startswiths: undefined,
  nstartswiths: undefined,
  endswith: ({ field, value }: TypedLogicalFilter<string>) =>
    `${field} ~ ${serialize("%" + escapeWildcards(value))}`,
  nendswith: ({ field, value }: TypedLogicalFilter<string>) =>
    `${field} !~ ${serialize("%" + escapeWildcards(value))}`,
  endswiths: undefined,
  nendswiths: undefined,
};

const conditionalOperators: Record<ConditionalFilter["operator"], string> = {
  and: "&&",
  or: "||",
};

const wrap = (maybeExpression?: string) =>
  maybeExpression ? `(${maybeExpression})` : undefined;

const isConditionalFilter = (filter: CrudFilter): filter is ConditionalFilter =>
  filter.operator === "and" || filter.operator === "or";

const getExpression = (filter: TypedLogicalFilter) => {
  const expressionFn = logicalOperators[filter.operator];
  if (!expressionFn) {
    throw Error(
      `operator "${filter.operator}" is not supported by refine-pocketbase`
    );
  }
  return expressionFn(filter);
};

export const transformFilter = (
  filters: CrudFilters,
  joinOperator: ConditionalFilter["operator"] = "and"
) =>
  filters
    .map((filter): string | undefined =>
      wrap(
        isConditionalFilter(filter)
          ? transformFilter(filter.value, filter.operator)
          : getExpression(filter)
      )
    )
    .filter((expression): expression is string => expression != null)
    .join(` ${conditionalOperators[joinOperator]} `);

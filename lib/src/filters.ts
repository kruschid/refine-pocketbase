import {
  ConditionalFilter,
  CrudFilter,
  CrudFilters,
  LogicalFilter
} from "@refinedev/core";

type FilterValue = string | number | boolean | Date | object;

type TypedLogicalFilter<T = FilterValue> = Omit<LogicalFilter, "value"> & {
  value: T;
}

type ExpressionFn = (filter: TypedLogicalFilter<any>) => string | undefined;

export const serialize = (value: FilterValue) => {
  // https://github.com/pocketbase/js-sdk/blob/848b77d467b093c6bfbb19799e54af3b7909222e/src/Client.ts#L271
  let val = value;
  switch (typeof val) {
    case "boolean":
    case "number":
      val = "" + val;
      break;
    case "string":
      val = "'" + val.replace(/'/g, "\\'") + "'";
      break;
    default:
      if (val === null) {
        val = "null";
      } else if (val instanceof Date) {
        val = "'" + val.toISOString().replace("T", " ") + "'";
      } else {
        val = "'" + JSON.stringify(val).replace(/'/g, "\\'") + "'";
      }
  }
  return val;
}

const escape = (value: string) =>
  value.replace(/\%/g, "\\%")

const defaultExpression = (operator?: string) => (filter: TypedLogicalFilter) =>
  `${filter.field} ${operator} ${serialize(filter.field)}`;

const logicalOperators: Record<LogicalFilter["operator"], ExpressionFn | undefined> = {
  eq: defaultExpression("="),
  ne: defaultExpression("!="),
  lt: defaultExpression("<"),
  gt: defaultExpression(">"),
  lte: defaultExpression("<="),
  gte: defaultExpression(">="),
  in: (filter: TypedLogicalFilter<FilterValue[]>) =>
    filter.value
      .map(value => `${filter.field} = ${serialize(value)}`)
      .join(" || ") || undefined,
  nin: (filter: TypedLogicalFilter<FilterValue[]>) =>
    filter.value
      .map(value => `${filter.field} != ${serialize(value)}`)
      .join(" && ") || undefined,
  ina: undefined,
  nina: undefined,
  contains: defaultExpression("~"),
  ncontains: defaultExpression("!~"),
  containss: undefined,
  ncontainss: undefined,
  between: ({field, value: [min, max]}: TypedLogicalFilter<[FilterValue, FilterValue]>) =>
      `${field} >= ${serialize(min)} && ${field} <= ${serialize(max)}`,
  nbetween: ({field, value: [min, max]}: TypedLogicalFilter<[FilterValue, FilterValue]>) =>
    `${field} < ${serialize(min)} || ${field} > ${serialize(max)}`,
  null: ({field, value}: TypedLogicalFilter<boolean>) =>
    value === true ? `${field} = null` : undefined,
  nnull: ({field, value}: TypedLogicalFilter<boolean>) =>
    value === true ? `${field} != null` : undefined,
  startswith: ({field, value}: TypedLogicalFilter<string>) =>
    `${field} = '${escape(value)}%'`,
  nstartswith: ({field, value}: TypedLogicalFilter<string>) =>
    `${field} != '${escape(value)}%'`,
  startswiths: undefined,
  nstartswiths: undefined,
  endswith: ({field, value}: TypedLogicalFilter<string>) =>
    `${field} = '%${escape(value)}'`,
  nendswith: ({field, value}: TypedLogicalFilter<string>) =>
    `${field} != '%${escape(value)}'`,
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
  if(!expressionFn) {
    throw Error(`operator "${filter.operator}" is not supported by refine-pocketbase`);
  }
  return expressionFn(filter);
}

export const transformFilter = (
  filters: CrudFilters,
  joinOperator: ConditionalFilter["operator"] = "and",
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

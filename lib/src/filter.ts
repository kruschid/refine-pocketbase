import { CrudFilter, LogicalFilter } from "@refinedev/core";
import { nanoid } from "nanoid";

const wrap = (str: string, wrapper = '"') =>
  str?.trim() ? `${wrapper}${str}${wrapper}` : '';

type ExpressionBindings = {
  expression: string,
  bindings: Record<string, unknown>
}

// Higher order function for simple `<operator1> <operand> <operator2>` query builder
const defaultNanoidExpression = (operator: string) => (operand1: string, operand2: unknown): ExpressionBindings => {
  const id = nanoid()
  return { expression: `${operand1} ${operator} {:${id}}`, bindings: { [id]: operand2 } }
}

const OPERATOR_MAP = {
  eq: {
    exprBuilder: defaultNanoidExpression("="),
  },
  ne: {
    exprBuilder: defaultNanoidExpression("!="),
  },
  lt: {
    exprBuilder: defaultNanoidExpression("<"),
  },
  gt: {
    exprBuilder: defaultNanoidExpression(">"),
  },
  lte: {
    exprBuilder: defaultNanoidExpression("<="),
  },
  gte: {
    exprBuilder: defaultNanoidExpression(">="),
  },
  contains: {
    exprBuilder: defaultNanoidExpression("~"),
  },
  ncontains: {
    exprBuilder: defaultNanoidExpression("!~"),
  },
  containss: {
    exprBuilder: defaultNanoidExpression("~"),
  },
  ncontainss: {
    exprBuilder: defaultNanoidExpression("!~"),
  },
  startswith: {
    exprBuilder: defaultNanoidExpression("~"),
  },
  nstartswith: {
    exprBuilder: defaultNanoidExpression("!~"),
  },
  startswiths: {
    exprBuilder: defaultNanoidExpression("~"),
  },
  nstartswiths: {
    exprBuilder: defaultNanoidExpression("!~"),
  },
  endswith: {
    exprBuilder: defaultNanoidExpression("~"),
  },
  nendswith: {
    exprBuilder: defaultNanoidExpression("!~"),
  },
  endswiths: {
    exprBuilder: defaultNanoidExpression("~"),
  },
  nendswiths: {
    exprBuilder: defaultNanoidExpression("!~"),
  },
  null: {
    exprBuilder: (operand1: string, operand2: unknown): ExpressionBindings => {
      return { expression: operand2 === true ? `${operand1} = null` : `${operand1} != null`, bindings: {} }
    },
  },
  nnull: {
    exprBuilder: (operand1: string, operand2: unknown): ExpressionBindings => {
      return { expression: operand2 === true ? `${operand1} != null` : `${operand1} = null`, bindings: {} }
    },
  },
  between: {
    exprBuilder: (operand1: string, operand2: unknown[]): ExpressionBindings => {
      const [id1, id2] = [nanoid(), nanoid()]
      return { expression: `(${operand1} >= {:${id1}} && ${operand1} <= {:${id2}})`, bindings: { [id1]: operand2[0], [id2]: operand2[1] } }
    },
  },
  nbetween: {
    exprBuilder: (operand1: string, operand2: unknown[]): ExpressionBindings => {
      const [id1, id2] = [nanoid(), nanoid()]
      return { expression: `(${operand1} < {:${id1}} && ${operand1} > {:${id2}})`, bindings: { [id1]: operand2[0], [id2]: operand2[1] } }
    },
  },
  in: {
    exprBuilder: (operand1: string, operand2: unknown[]): ExpressionBindings => {
      const ids = operand2.map(v => nanoid())
      const bindings = operand2.map((operand, i) => [ids[i], operand])
      return { expression: operand2.map(value => `${operand1} = {:${value}}`).join(" || "), bindings: Object.fromEntries(bindings) }
    },
  },
  nin: {
    exprBuilder: (operand1: string, operand2: unknown[]): ExpressionBindings => {
      const ids = operand2.map(v => nanoid())
      const bindings = operand2.map((operand, i) => [ids[i], operand])
      return { expression: operand2.map(value => `${operand1} != {:${value}}`).join(" || "), bindings: Object.fromEntries(bindings) }
    },
  },
  ina: undefined,
  nina: undefined,
  or: undefined, // TODO: implement this
  and: undefined, // TODO: implement this
};

export class FilterBuilder {
  // TODO: handle conditional filters as well
  private readonly filters: LogicalFilter[]
  private bindingValues: Record<string, unknown>

  constructor(filters: LogicalFilter[]) {
    this.filters = filters
    this.bindingValues = {}
  }

  public buildBindignString(): string {
    // TODO: call this recursively for conditional expression
    return this.filters
      .map((filter: LogicalFilter) => {
        const operator = OPERATOR_MAP[filter.operator]
        if (!operator) {
          throw Error(`operator "${operator}" is not supported by refine-pocketbase`);
        }

        const { expression, bindings } = operator.exprBuilder(filter.field, filter.value)
        this.bindingValues = { ...this.bindingValues, ...bindings }

        return expression
      })
      .join(" && ")
  }

  public getBindingValues(): Record<string, unknown> {
    return this.bindingValues
  }

  private isConditionalFilter(filter: CrudFilter): boolean {
    return filter.operator === "and" || filter.operator === "or";
  }
}
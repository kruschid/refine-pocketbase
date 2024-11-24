import { ConditionalFilter, CrudFilter } from "@refinedev/core";

const uid = (): string => {
  return "id" + Math.random().toString(16).slice(2)
}

type ExpressionBindings = {
  expression: string,
  bindings: Record<string, unknown>
}

type BuilderArgs = {
  operand1?: string,
  operand2?: unknown | unknown[],
  filters?: CrudFilter[]
}

// Higher order function for simple `<operator1> <operand> <operator2>` query builder
const defaultUidExpression = (operator: string) => ({ operand1, operand2 }: BuilderArgs): ExpressionBindings => {
  const id = uid()
  return { expression: `${operand1} ${operator} {:${id}}`, bindings: { [id]: operand2 } }
}

const OPERATOR_MAP = {
  eq: {
    exprBuilder: defaultUidExpression("="),
  },
  ne: {
    exprBuilder: defaultUidExpression("!="),
  },
  lt: {
    exprBuilder: defaultUidExpression("<"),
  },
  gt: {
    exprBuilder: defaultUidExpression(">"),
  },
  lte: {
    exprBuilder: defaultUidExpression("<="),
  },
  gte: {
    exprBuilder: defaultUidExpression(">="),
  },
  contains: {
    exprBuilder: defaultUidExpression("~"),
  },
  ncontains: {
    exprBuilder: defaultUidExpression("!~"),
  },
  containss: {
    exprBuilder: defaultUidExpression("~"),
  },
  ncontainss: {
    exprBuilder: defaultUidExpression("!~"),
  },
  startswith: {
    exprBuilder: defaultUidExpression("~"),
  },
  nstartswith: {
    exprBuilder: defaultUidExpression("!~"),
  },
  startswiths: {
    exprBuilder: defaultUidExpression("~"),
  },
  nstartswiths: {
    exprBuilder: defaultUidExpression("!~"),
  },
  endswith: {
    exprBuilder: defaultUidExpression("~"),
  },
  nendswith: {
    exprBuilder: defaultUidExpression("!~"),
  },
  endswiths: {
    exprBuilder: defaultUidExpression("~"),
  },
  nendswiths: {
    exprBuilder: defaultUidExpression("!~"),
  },
  null: {
    exprBuilder: ({ operand1, operand2 }: BuilderArgs): ExpressionBindings => {
      return {
        expression: operand2 as boolean === true ? `${operand1} = null` : `${operand1} != null`,
        bindings: {}
      }
    },
  },
  nnull: {
    exprBuilder: ({ operand1, operand2 }: BuilderArgs): ExpressionBindings => {
      return {
        expression: operand2 as boolean === true ? `${operand1} != null` : `${operand1} = null`,
        bindings: {}
      }
    },
  },
  between: {
    exprBuilder: ({ operand1, operand2 }: BuilderArgs): ExpressionBindings => {
      const operands = operand2 as unknown[]
      if (operands.length == 0 || operands.length > 2) {
        return { expression: "", bindings: {} }
      }

      const [id1, id2] = [uid(), uid()]
      return {
        expression: `(${operand1} >= {:${id1}} && ${operand1} <= {:${id2}})`,
        bindings: { [id1]: operands[0], [id2]: operands[1] }
      }
    },
  },
  nbetween: {
    exprBuilder: ({ operand1, operand2 }: BuilderArgs): ExpressionBindings => {
      const operands = operand2 as unknown[]
      if (operands.length == 0 || operands.length > 2) {
        return { expression: "", bindings: {} }
      }

      const [id1, id2] = [uid(), uid()]
      return {
        expression: `(${operand1} < {:${id1}} && ${operand1} > {:${id2}})`,
        bindings: { [id1]: operands[0], [id2]: operands[1] }
      }
    },
  },
  in: {
    exprBuilder: ({ operand1, operand2 }: BuilderArgs): ExpressionBindings => {
      const operators = operand2 as unknown[]
      const ids = operators.map(v => uid())
      const bindings = operators.map((operand, i) => [ids[i], operand])
      return {
        expression: operators.map(value => `${operand1} = {:${value}}`).join(" || "),
        bindings: Object.fromEntries(bindings)
      }
    },
  },
  nin: {
    exprBuilder: ({ operand1, operand2 }: BuilderArgs): ExpressionBindings => {
      const operators = operand2 as unknown[]
      const ids = operators.map(v => uid())
      const bindings = operators.map((operand, i) => [ids[i], operand])
      return {
        expression: operators.map(value => `${operand1} != {:${value}}`).join(" || "),
        bindings: Object.fromEntries(bindings)
      }
    },
  },
  or: {
    exprBuilder: ({ filters }: BuilderArgs): ExpressionBindings => {
      let bindings = {}
      const expression =
        filters!.map(filter => {
          const builder = new FilterBuilder([filter])
          const expression = builder.buildBindingString()
          const currBindings = builder.getBindingValues()
          bindings = { ...bindings, ...currBindings }

          return expression
        })
          .map(expression => `(${expression})`)
          .join(" || ")

      return { expression, bindings }
    }
  },
  and: {
    exprBuilder: ({ filters }: BuilderArgs): ExpressionBindings => {
      let bindings = {}
      const expression = filters!.map(filter => {
        const builder = new FilterBuilder([filter])
        const expression = builder.buildBindingString()
        const currBindings = builder.getBindingValues()
        bindings = { ...bindings, ...currBindings }

        return expression
      })
        .map(expression => `(${expression})`)
        .join(" && ")

      return { expression, bindings }
    }
  },
  ina: undefined,
  nina: undefined,
};

export class FilterBuilder {
  private readonly filters: CrudFilter[]
  private bindingValues: Record<string, unknown>

  constructor(filters: CrudFilter[]) {
    this.filters = filters
    this.bindingValues = {}
  }

  public buildBindingString(): string {
    return this.filters
      .map((filter: CrudFilter) => {
        const operator = OPERATOR_MAP[filter.operator]
        if (!operator) {
          throw Error(`operator "${filter.operator}" is not supported by refine-pocketbase`);
        }

        const { expression, bindings } =
          this.isConditionalFilter(filter) ?
            operator.exprBuilder({ filters: filter.value })
            : operator.exprBuilder({ operand1: filter.field, operand2: filter.value })

        this.bindingValues = { ...this.bindingValues, ...bindings }
        return expression
      })
      .join(" && ")
  }

  public getBindingValues(): Record<string, unknown> {
    return this.bindingValues
  }

  private isConditionalFilter(filter: CrudFilter): filter is ConditionalFilter {
    return filter.operator === "and" || filter.operator === "or";
  }
}
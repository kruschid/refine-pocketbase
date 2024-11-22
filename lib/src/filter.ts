import { CrudFilter, LogicalFilter } from "@refinedev/core";
import { nanoid } from "nanoid";

const wrap = (str: string, wrapper = '"') => 
  str?.trim() ? `${wrapper}${str}${wrapper}` : '';

const OPERATOR_MAP = {
	eq: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} = {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	ne: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} != {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	lt: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} < {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	gt: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} > {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	lte: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} <= {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	gte: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} >= {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	contains: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} ~ {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	ncontains: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} !~ {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	containss: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} ~ {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	ncontainss: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} !~ {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	startswith: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} ~ {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	nstartswith: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} !~ {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	startswiths: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} ~ {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	nstartswiths: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} !~ {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	endswith: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} ~ {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	nendswith: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} !~ {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	endswiths: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} ~ {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	nendswiths: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return `${operand1} !~ {:${operand2}}`
		},
		isBindable: true,
		paramsIterable: false
	},
	null: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return operand2 === true ? `${operand1} = null` : `${operand1} != null`
		},
		isBindable: false,
		paramsIterable: false
	},
	nnull: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown }): string => {
			return operand2 === true ? `${operand1} != null` : `${operand1} = null`
		},
		isBindable: false,
		paramsIterable: false
	},
	between: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown[] }): string => {
			return `(${operand1} >= {:${operand2[0]}} && ${operand1} <= {:${operand2[1]}})`
		},
		isBindable: true,
		paramsIterable: true
	},
	nbetween: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown[] }): string => {
			return `(${operand1} < {:${operand2[0]}} && ${operand1} > {:${operand2[1]}})`
		},
		isBindable: true,
		paramsIterable: true
	},
	in: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown[] }): string => {
			return operand2.map(value => `${operand1} = {:${value}}`).join(" || ")
		},
		isBindable: true,
		paramsIterable: true
	},
	nin: {
		queryBuilder: ({ operand1, operand2 }: { operand1: string, operand2: unknown[] }): string => {
			return operand2.map(value => `${operand1} != {:${value}}`).join(" || ")
		},
		isBindable: true,
		paramsIterable: true
	},
	ina: undefined,
	nina: undefined,
	or: undefined,
	and: undefined,
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
		return this.filters
			.map((filter: LogicalFilter) => {
				const operator = OPERATOR_MAP[filter.operator]
				if (!operator) return ""

				let operand2 = filter.value
				if (operator.paramsIterable && operator.isBindable) {
					operand2 = filter.value.map(v => nanoid())
				} else if (operator.isBindable) {
					operand2 = nanoid()
				}

				const filterString = operator.queryBuilder({ operand1: filter.field, operand2: operand2 })
				if (operator.paramsIterable && operator.isBindable) {
					filter.value.map((v: any, i: any) => this.bindingValues[operand2[i]] = v)
				} else if (operator.isBindable) {
					this.bindingValues[operand2] = filter.value
				}

				return filterString
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
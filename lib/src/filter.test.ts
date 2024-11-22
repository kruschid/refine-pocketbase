import { LogicalFilter } from '@refinedev/core';
import { describe, expect, test } from "vitest";
import { FilterBuilder } from "./filter";

describe("FilterBuilder", () => {
	describe("buildBindingString", () => {

		test.each([
			[{ field: "foo", operator: "eq", value: "bar" }, "="],
			[{ field: "foo", operator: "ne", value: "bar" }, "!="],
			[{ field: "foo", operator: "lt", value: "bar" }, "<"],
			[{ field: "foo", operator: "gt", value: "bar" }, ">"],
			[{ field: "foo", operator: "lte", value: "bar" }, "<="],
			[{ field: "foo", operator: "gte", value: "bar" }, ">="],
			[{ field: "foo", operator: "contains", value: "bar" }, "~"],
			[{ field: "foo", operator: "ncontains", value: "bar" }, "!~"],
			[{ field: "foo", operator: "containss", value: "bar" }, "~"],
			[{ field: "foo", operator: "ncontainss", value: "bar" }, "!~"],
			[{ field: "foo", operator: "startswith", value: "bar" }, "~"],
			[{ field: "foo", operator: "startswiths", value: "bar" }, "~"],
			[{ field: "foo", operator: "nstartswiths", value: "bar" }, "!~"],
			[{ field: "foo", operator: "endswith", value: "bar" }, "~"],
			[{ field: "foo", operator: "endswiths", value: "bar" }, "~"],
			[{ field: "foo", operator: "nendswiths", value: "bar" }, "!~"],
		])("simple filter expression", (value, expectedOperator) => {
			const builder = new FilterBuilder([value as LogicalFilter])
			const bindingString = builder.buildBindignString()
			const bindingValues = builder.getBindingValues()

			expect(bindingString).toMatch(new RegExp(`foo ${expectedOperator} \{\:.+\}`, "g"))
			expect(Object.values(bindingValues)).toEqual([value.value])
		})

		test("multiple filters", () => {
			const filters: LogicalFilter[] = [
				{ field: "foo", operator: "eq", value: "bar" },
				{ field: "fizz", operator: "eq", value: "buzz" },
			]
			const builder = new FilterBuilder(filters)
			const bindingString = builder.buildBindignString()
			const bindingValues = builder.getBindingValues()

			expect(bindingString).toMatch(/foo = {:.+} && fizz = {:.+}/)
			expect(Object.values(bindingValues)).toEqual(filters.map(v => v.value))
		})

		test("null and nnull expressions", () => {
			const filters: LogicalFilter[] = [
				{ field: "foo", operator: "null", value: true },
				{ field: "rfoo", operator: "null", value: false },
				{ field: "fizz", operator: "nnull", value: true },
				{ field: "rfizz", operator: "nnull", value: false },
			]
			const builder = new FilterBuilder(filters)
			const bindingString = builder.buildBindignString()

			expect(bindingString).toEqual("foo = null && rfoo != null && fizz != null && rfizz = null")
		})

		test("between expression", () => {
			const filters: LogicalFilter[] = [
				{ field: "foo", operator: "between", value: [3, 5] },
			]
			const builder = new FilterBuilder(filters)
			const bindingString = builder.buildBindignString()
			const bindingValues = builder.getBindingValues()

			expect(bindingString).toMatch(/foo >= {:.+} && foo <= {:.+}/)
			expect(Object.values(bindingValues)).toEqual([3, 5])
		})

		test("nbetween expression", () => {
			const filters: LogicalFilter[] = [
				{ field: "foo", operator: "nbetween", value: [3, 5] },
			]
			const builder = new FilterBuilder(filters)
			const bindingString = builder.buildBindignString()
			const bindingValues = builder.getBindingValues()

			expect(bindingString).toMatch(/foo < {:.+} && foo > {:.+}/)
			expect(Object.values(bindingValues)).toEqual([3, 5])
		})

		test("in expression", () => {
			const filters: LogicalFilter[] = [
				{ field: "foo", operator: "in", value: ["fizz", "buzz", "bar"] },
			]	

			const builder = new FilterBuilder(filters)
			const bindingString = builder.buildBindignString()
			const bindingValues = builder.getBindingValues()

			expect(bindingString).toMatch(/foo = {:.+} \|\| foo = {:.+} \|\| foo = {:.+}/)
			expect(Object.values(bindingValues)).toEqual(["fizz", "buzz", "bar"])
		})

		test("nin expression", () => {
			const filters: LogicalFilter[] = [
				{ field: "foo", operator: "nin", value: ["fizz", "buzz", "bar"] },
			]	

			const builder = new FilterBuilder(filters)
			const bindingString = builder.buildBindignString()
			const bindingValues = builder.getBindingValues()

			expect(bindingString).toMatch(/foo != {:.+} \|\| foo != {:.+} \|\| foo != {:.+}/)
			expect(Object.values(bindingValues)).toEqual(["fizz", "buzz", "bar"])
		})
	})
})

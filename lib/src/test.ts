import test from "tape";
import { serialize, transformFilter } from "./filters";
import { ConditionalFilter, LogicalFilter } from "@refinedev/core";

test("logical filters", (t) => {
  Array.from<[LogicalFilter["operator"], string]>([
    ["eq", "="],
    ["ne", "!="],
    ["lt", "<"],
    ["gt", ">"],
    ["lte", "<="],
    ["gte", ">="],
    ["contains", "~"],
    ["ncontains", "!~"],
  ]).forEach(([operator, output]) =>
    t.equals(
      transformFilter([
        {
          field: "a",
          operator,
          value: "a",
        },
      ]),
      `(a ${output} 'a')`,
      `should return logical filter expression for ${operator}`,
    )
  );
  t.end();
});

test("conditional filters", (t) => {
  Array.from<[ConditionalFilter["operator"], string]>([
    ["and", "&&"],
    ["or", "||"],
  ]).forEach(([operator, output]) =>
    t.equals(
      transformFilter([{
        operator,
        value: [
          {
            field: "a",
            operator: "eq",
            value: "a",
          },
          {
            field: "b",
            operator: "ne",
            value: "b",
          },
        ]
      }
      ]),
      `((a = 'a') ${output} (b != 'b'))`,
      `should return conditional filter expression for ${operator}`
    )
  );
});

test("value serialization", (t) => {
  [
    ["string", "'string'"],
    ["don't", "'don\'t'"],
    [5, "5"],
    [true, "true"],
    [new Date(0), "2024-12-04 16:55:13.001Z"],
    [null, "null"],
    [{a: "don't"}, `'{"a": "don\'t"}'`],
  ].forEach((value, output) =>
    t.equals(
      serialize(value),
      output,
      `should serialize ${value} (${typeof value})`
    )
  );
  t.end();
});

test("in operator", (t) => {
  t.equals(
    transformFilter([{
      field: "a",
      operator: "in",
      value: [],
    }]),
    "",
    "in handles empty values"
  );

  t.equals(
    transformFilter([{
      operator: "and",
      value: [{
        field: "a",
        operator: "in",
        value: []
      }, {
        field: "b",
        operator: "eq",
        value: "4"
      }],
    }]),
    "((b = 'b'))",
    "in handles empty values when nested"
  );

  t.equals(
    transformFilter([{
      operator: "and",
      value: [{
        field: "a",
        operator: "in",
        value: ["1", "2", "3"]
      }, {
        field: "b",
        operator: "eq",
        value: "4"
      }],
    }]),
    "((a = '1' || a = '2' || a = '3') && (b = 'b'))",
    "in can be nested"
  );

  t.equals(
    transformFilter([{
      field: "a",
      operator: "in",
      value: ["1", "2", "3"],
    }]),
    "(a = '1' || a = '2' || a = '3')",
    "in handles empty values"
  );

  t.end();
});

test.skip("nin", t => {});
test.skip("between", t => {});
test.skip("nbetween", t => {});
test.skip("null", t => {});
test.skip("nnull", t => {});
test.skip("startswith", t => {});
test.skip("nstartswith", t => {});
test.skip("endswith", t => {});
test.skip("nendswith", t => {});

test.skip("deeply nested filters", (t) => {
  t.equals(
    transformFilter([
      {
        field: "a",
        operator: "eq",
        value: "a",
      },
      {
        field: "b",
        operator: "ne",
        value: "b",
      },
    ]),
    "a = 'a' && b != 'b'"
  );

  t.equals(
    transformFilter([
      {
        operator: "or",
        value: [
          {
            field: "a",
            operator: "gt",
            value: "a",
          },
          {
            field: "b",
            operator: "lt",
            value: "b",
          },
        ],
      },
      {
        operator: "and",
        value: [
          {
            field: "c",
            operator: "contains",
            value: "c",
          },
          {
            field: "d",
            operator: "ncontains",
            value: "d",
          },
        ],
      },
    ]),
    "(a > 'a' || b < 'b') && (c ~ 'c' && d !~ 'd')"
  );

  t.equals(
    transformFilter([
      {
        operator: "or",
        value: [
          {
            operator: "and",
            value: [
              {
                field: "a",
                operator: "in",
                value: ["1", "2"],
              },
              {
                field: "b",
                operator: "nin",
                value: ["3", "4"],
              },
            ],
          },
          {
            operator: "and",
            value: [
              {
                field: "a",
                operator: "gte",
                value: "1",
              },
              {
                field: "b",
                operator: "lte",
                value: "4",
              },
            ],
          },
        ],
      },
    ]),
    "(((a = '1' || a = '2') && (b != '3' && b != '4') || (a >= 'a' && b <= 'b'))"
  );

  t.end();
});

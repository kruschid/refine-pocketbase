import test from "tape";
import { FilterValue, serialize, transformFilter } from "./filters";
import { ConditionalFilter, LogicalFilter } from "@refinedev/core";

test("value serialization", (t) => {
  [
    ["string", "'string'"],
    ["don't", "'don\\'t'"],
    [5, "5"],
    [true, "true"],
    [new Date(0), "'1970-01-01 00:00:00.000Z'"],
    [null, "null"],
    [{ a: "don't" }, `'{"a":"don\\'t"}'`],
  ].forEach(([value, output]) =>
    t.equals(
      serialize(value),
      output,
      `should serialize ${value} (${typeof value})`
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
      transformFilter([
        {
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
          ],
        },
      ]),
      `((a = 'a') ${output} (b != 'b'))`,
      `should return conditional filter expression for ${operator}`
    )
  );
  t.end();
});

test("logical filters", (t) => {
  Array.from<[LogicalFilter["operator"], FilterValue, string]>([
    ["eq", 1, "(a = 1)"],
    ["ne", 2, "(a != 2)"],
    ["lt", 3, "(a < 3)"],
    ["gt", 4, "(a > 4)"],
    ["lte", 5, "(a <= 5)"],
    ["gte", 6, "(a >= 6)"],
    ["contains", 7, "(a ~ 7)"],
    ["ncontains", 8, "(a !~ 8)"],
    ["in", [], ""],
    ["in", [1], "(a = 1)"],
    ["in", [2, 3, 4], "(a = 2 || a = 3 || a = 4)"],
    ["nin", [], ""],
    ["nin", [1], "(a != 1)"],
    ["nin", [2, 3, 4], "(a != 2 && a != 3 && a != 4)"],
    ["between", [], ""],
    ["between", [1], "(a >= 1)"],
    ["between", [undefined, 2], "(a <= 2)"],
    ["between", [1, 2], "(a >= 1 && a <= 2)"],
    ["nbetween", [], ""],
    ["nbetween", [1], "(a < 1)"],
    ["nbetween", [undefined, 2], "(a > 2)"],
    ["nbetween", [1, 2], "(a < 1 || a > 2)"],
    ["null", true, "(a = null)"],
    ["null", false, "(a != null)"],
    ["nnull", true, "(a != null)"],
    ["nnull", false, "(a = null)"],
    ["startswith", "a", "(a ~ 'a%')"],
    ["startswith", "%b", "(a ~ '\\%b%')"],
    ["nstartswith", "c", "(a !~ 'c%')"],
    ["nstartswith", "%d", "(a !~ '\\%d%')"],
    ["endswith", "e", "(a ~ '%e')"],
    ["endswith", "f%", "(a ~ '%f\\%')"],
    ["nendswith", "g", "(a !~ '%g')"],
    ["nendswith", "h%", "(a !~ '%h\\%')"],
  ]).forEach(([operator, value, output]) =>
    t.equals(
      transformFilter([
        {
          field: "a",
          operator,
          value,
        },
      ]),
      output,
      `should return logical filter expression for ${operator}`
    )
  );

  t.end();
});

test("nested logical filters", (t) => {
  Array.from<[LogicalFilter["operator"], FilterValue, string]>([
    ["eq", 1, "((a = 1) && (b = '4'))"],
    ["ne", 2, "((a != 2) && (b = '4'))"],
    ["lt", 3, "((a < 3) && (b = '4'))"],
    ["gt", 4, "((a > 4) && (b = '4'))"],
    ["lte", 5, "((a <= 5) && (b = '4'))"],
    ["gte", 6, "((a >= 6) && (b = '4'))"],
    ["contains", 7, "((a ~ 7) && (b = '4'))"],
    ["ncontains", 8, "((a !~ 8) && (b = '4'))"],
    ["in", [], "((b = '4'))"],
    ["in", [1], "((a = 1) && (b = '4'))"],
    ["in", [2, 3, 4], "((a = 2 || a = 3 || a = 4) && (b = '4'))"],
    ["nin", [], "((b = '4'))"],
    ["nin", [1], "((a != 1) && (b = '4'))"],
    ["nin", [2, 3, 4], "((a != 2 && a != 3 && a != 4) && (b = '4'))"],
    ["between", [], "((b = '4'))"],
    ["between", [1], "((a >= 1) && (b = '4'))"],
    ["between", [undefined, 2], "((a <= 2) && (b = '4'))"],
    ["between", [1, 2], "((a >= 1 && a <= 2) && (b = '4'))"],
    ["nbetween", [], "((b = '4'))"],
    ["nbetween", [1], "((a < 1) && (b = '4'))"],
    ["nbetween", [undefined, 2], "((a > 2) && (b = '4'))"],
    ["nbetween", [1, 2], "((a < 1 || a > 2) && (b = '4'))"],
    ["null", true, "((a = null) && (b = '4'))"],
    ["null", false, "((a != null) && (b = '4'))"],
    ["nnull", true, "((a != null) && (b = '4'))"],
    ["nnull", false, "((a = null) && (b = '4'))"],
    ["startswith", "a", "((a ~ 'a%') && (b = '4'))"],
    ["startswith", "%b", "((a ~ '\\%b%') && (b = '4'))"],
    ["nstartswith", "c", "((a !~ 'c%') && (b = '4'))"],
    ["nstartswith", "%d", "((a !~ '\\%d%') && (b = '4'))"],
    ["endswith", "e", "((a ~ '%e') && (b = '4'))"],
    ["endswith", "f%", "((a ~ '%f\\%') && (b = '4'))"],
    ["nendswith", "g", "((a !~ '%g') && (b = '4'))"],
    ["nendswith", "h%", "((a !~ '%h\\%') && (b = '4'))"],
  ]).forEach(([operator, value, output]) =>
    t.equals(
      transformFilter([
        {
          operator: "and",
          value: [
            {
              field: "a",
              operator,
              value,
            },
            {
              field: "b",
              operator: "eq",
              value: "4",
            },
          ],
        },
      ]),
      output,
      `should return logical filter expression for ${operator}`
    )
  );

  t.end();
});

test("deeply nested logical filters", (t) => {
  Array.from<[LogicalFilter["operator"], FilterValue, string]>([
    ["eq", 1, "(((a = 1) && (b = '4')) || (c > 1))"],
    ["ne", 2, "(((a != 2) && (b = '4')) || (c > 1))"],
    ["lt", 3, "(((a < 3) && (b = '4')) || (c > 1))"],
    ["gt", 4, "(((a > 4) && (b = '4')) || (c > 1))"],
    ["lte", 5, "(((a <= 5) && (b = '4')) || (c > 1))"],
    ["gte", 6, "(((a >= 6) && (b = '4')) || (c > 1))"],
    ["contains", 7, "(((a ~ 7) && (b = '4')) || (c > 1))"],
    ["ncontains", 8, "(((a !~ 8) && (b = '4')) || (c > 1))"],
    ["in", [], "(((b = '4')) || (c > 1))"],
    ["in", [1], "(((a = 1) && (b = '4')) || (c > 1))"],
    ["in", [2, 3, 4], "(((a = 2 || a = 3 || a = 4) && (b = '4')) || (c > 1))"],
    ["nin", [], "(((b = '4')) || (c > 1))"],
    ["nin", [1], "(((a != 1) && (b = '4')) || (c > 1))"],
    [
      "nin",
      [2, 3, 4],
      "(((a != 2 && a != 3 && a != 4) && (b = '4')) || (c > 1))",
    ],
    ["between", [], "(((b = '4')) || (c > 1))"],
    ["between", [1], "(((a >= 1) && (b = '4')) || (c > 1))"],
    ["between", [undefined, 2], "(((a <= 2) && (b = '4')) || (c > 1))"],
    ["between", [1, 2], "(((a >= 1 && a <= 2) && (b = '4')) || (c > 1))"],
    ["nbetween", [], "(((b = '4')) || (c > 1))"],
    ["nbetween", [1], "(((a < 1) && (b = '4')) || (c > 1))"],
    ["nbetween", [undefined, 2], "(((a > 2) && (b = '4')) || (c > 1))"],
    ["nbetween", [1, 2], "(((a < 1 || a > 2) && (b = '4')) || (c > 1))"],
    ["null", true, "(((a = null) && (b = '4')) || (c > 1))"],
    ["null", false, "(((a != null) && (b = '4')) || (c > 1))"],
    ["nnull", true, "(((a != null) && (b = '4')) || (c > 1))"],
    ["nnull", false, "(((a = null) && (b = '4')) || (c > 1))"],
    ["startswith", "a", "(((a ~ 'a%') && (b = '4')) || (c > 1))"],
    ["startswith", "%b", "(((a ~ '\\%b%') && (b = '4')) || (c > 1))"],
    ["nstartswith", "c", "(((a !~ 'c%') && (b = '4')) || (c > 1))"],
    ["nstartswith", "%d", "(((a !~ '\\%d%') && (b = '4')) || (c > 1))"],
    ["endswith", "e", "(((a ~ '%e') && (b = '4')) || (c > 1))"],
    ["endswith", "f%", "(((a ~ '%f\\%') && (b = '4')) || (c > 1))"],
    ["nendswith", "g", "(((a !~ '%g') && (b = '4')) || (c > 1))"],
    ["nendswith", "h%", "(((a !~ '%h\\%') && (b = '4')) || (c > 1))"],
  ]).forEach(([operator, value, output]) =>
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
                  operator,
                  value,
                },
                {
                  field: "b",
                  operator: "eq",
                  value: "4",
                },
              ],
            },
            {
              field: "c",
              operator: "gt",
              value: 1,
            },
          ],
        },
      ]),
      output,
      `should return logical filter expression for ${operator}`
    )
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
                value: [],
              },
              {
                field: "b",
                operator: "between",
                value: [],
              },
            ],
          },
          {
            field: "c",
            operator: "nin",
            value: [],
          },
        ],
      },
      {
        field: "b",
        operator: "nbetween",
        value: [],
      },
    ]),
    "",
    "deeply nested empty filters should not generate an expression"
  );

  t.end();
});

import test from "tape";
import { extractFilterValues, extractFilterExpression } from "./utils.js";

test("stringifyFilters", (t) => {
  t.equals(
    extractFilterExpression([
      {
        field: "a",
        operator: "eq",
        value: "",
      },
      {
        field: "b",
        operator: "ne",
        value: "",
      },
    ]),
    "a = {:a00} && b != {:b01}"
  );

  t.equals(
    extractFilterExpression([
      {
        operator: "or",
        value: [
          {
            field: "a",
            operator: "gt",
            value: "",
          },
          {
            field: "b",
            operator: "lt",
            value: "",
          },
        ],
      },
      {
        operator: "and",
        value: [
          {
            field: "a",
            operator: "contains",
            value: "",
          },
          {
            field: "b",
            operator: "ncontains",
            value: "",
          },
        ],
      },
    ]),
    "(a > {:a00} || b < {:b01}) && (a ~ {:a10} && b !~ {:b11})"
  );

  t.equals(
    extractFilterExpression([
      {
        operator: "or",
        value: [
          {
            operator: "and",
            value: [
              {
                field: "a",
                operator: "in",
                value: ["", "", ""],
              },
              {
                field: "b",
                operator: "nin",
                value: [""],
              },
            ],
          },
          {
            operator: "and",
            value: [
              {
                field: "a",
                operator: "gte",
                value: "",
              },
              {
                field: "b",
                operator: "lte",
                value: "",
              },
            ],
          },
        ],
      },
    ]),
    "(((a = {:a000} || a = {:a001} || a = {:a002}) && (b != {:b010})) || (a >= {:a10} && b <= {:b11}))"
  );

  t.end();
});

test("extractFilterValues", (t) => {
  t.deepEqual(
    extractFilterValues([
      {
        field: "a",
        operator: "eq",
        value: 1,
      },
      {
        field: "b",
        operator: "ne",
        value: 2,
      },
    ]),
    { a00: 1, b01: 2 }
  );

  t.deepEqual(
    extractFilterValues([
      {
        operator: "or",
        value: [
          {
            field: "a",
            operator: "gt",
            value: 4,
          },
          {
            field: "b",
            operator: "lt",
            value: 3,
          },
        ],
      },
      {
        operator: "and",
        value: [
          {
            field: "a",
            operator: "contains",
            value: 2,
          },
          {
            field: "b",
            operator: "ncontains",
            value: 1,
          },
        ],
      },
    ]),
    { a00: 4, b01: 3, a10: 2, b11: 1 }
  );

  t.deepEqual(
    extractFilterValues([
      {
        operator: "or",
        value: [
          {
            operator: "and",
            value: [
              {
                field: "a",
                operator: "in",
                value: [5, 9],
              },
              {
                field: "b",
                operator: "nin",
                value: [6],
              },
            ],
          },
          {
            operator: "and",
            value: [
              {
                field: "a",
                operator: "gte",
                value: 7,
              },
              {
                field: "b",
                operator: "lte",
                value: 8,
              },
            ],
          },
        ],
      },
    ]),
    { a000: 5, a001: 9, b010: 6, a10: 7, b11: 8 }
  );

  t.end();
});

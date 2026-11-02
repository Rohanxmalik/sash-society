import { describe, expect, test } from "vitest";
import { parseCsv, toCsv } from "./csv";

const BOM = "﻿";

describe("toCsv", () => {
  test("starts with a byte order mark so Excel reads Indian names correctly", () => {
    expect(toCsv(["Name"], []).startsWith(BOM)).toBe(true);
  });

  test("uses Windows line endings", () => {
    expect(toCsv(["A"], [["1"]])).toBe(`${BOM}A\r\n1\r\n`);
  });

  test("quotes commas, quotes and line breaks", () => {
    const csv = toCsv(["A", "B"], [['say "hi", ok', "two\nlines"]]);

    expect(csv).toBe(`${BOM}A,B\r\n"say ""hi"", ok","two\nlines"\r\n`);
  });

  test("writes empty cells for missing values", () => {
    expect(toCsv(["A", "B"], [[null, undefined]])).toBe(`${BOM}A,B\r\n,\r\n`);
  });

  test.each([
    ["=HYPERLINK(\"http://evil\")"],
    ["@SUM(A1)"],
    ["+cmd|' /C calc'!A0"],
    ["-2+3+cmd|' /C calc'!A0"],
  ])("stops Excel running the formula %s", (value) => {
    const [, row] = toCsv(["A"], [[value]]).trim().split("\r\n");

    expect(row.replace(/^"/, "").startsWith("'")).toBe(true);
  });

  test("leaves phone numbers readable", () => {
    expect(toCsv(["A"], [["+91 98765 43210"]])).toBe(
      `${BOM}A\r\n+91 98765 43210\r\n`
    );
  });
});

describe("parseCsv", () => {
  test("reads rows and ignores a byte order mark", () => {
    expect(parseCsv(`${BOM}a,b\r\n1,2\r\n`)).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  test("handles quoted commas, quotes and line breaks", () => {
    expect(parseCsv('"a,b","say ""hi""","two\nlines"\n')).toEqual([
      ["a,b", 'say "hi"', "two\nlines"],
    ]);
  });

  test("skips blank lines", () => {
    expect(parseCsv("a\n\nb\n")).toEqual([["a"], ["b"]]);
  });
});

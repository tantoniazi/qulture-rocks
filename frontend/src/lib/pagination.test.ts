import { parsePage } from "./pagination";

describe("parsePage", () => {
  it("reads a page number from the URL", () => {
    expect(parsePage("3")).toBe(3);
  });

  it("falls back to the first page when the parameter is missing", () => {
    expect(parsePage(null)).toBe(1);
  });

  it("falls back to the first page for values that are not positive numbers", () => {
    expect(parsePage("abc")).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-2")).toBe(1);
  });
});

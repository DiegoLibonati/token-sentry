import { isValidRegExpFlags } from "@/helpers/isValidRegExpFlags";

describe("isValidRegExpFlags", () => {
  it("returns true for valid flags", () => {
    expect(isValidRegExpFlags("")).toBe(true);
    expect(isValidRegExpFlags("g")).toBe(true);
    expect(isValidRegExpFlags("gi")).toBe(true);
    expect(isValidRegExpFlags("gimsuy")).toBe(true);
  });

  it("returns false for unknown flag characters", () => {
    expect(isValidRegExpFlags("x")).toBe(false);
    expect(isValidRegExpFlags("gz")).toBe(false);
  });

  it("returns false for duplicate flags", () => {
    expect(isValidRegExpFlags("gg")).toBe(false);
    expect(isValidRegExpFlags("gig")).toBe(false);
  });
});

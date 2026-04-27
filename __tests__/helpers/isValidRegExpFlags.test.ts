import { isValidRegExpFlags } from "@/helpers/isValidRegExpFlags";

describe("isValidRegExpFlags", () => {
  describe("valid flags", () => {
    it("should return true for empty string", () => {
      expect(isValidRegExpFlags("")).toBe(true);
    });

    it("should return true for a single valid flag", () => {
      expect(isValidRegExpFlags("g")).toBe(true);
    });

    it("should return true for all valid flags combined", () => {
      expect(isValidRegExpFlags("gimsuy")).toBe(true);
    });

    it("should return true for a subset of valid flags", () => {
      expect(isValidRegExpFlags("gi")).toBe(true);
    });

    it("should return true for flags in different order", () => {
      expect(isValidRegExpFlags("ig")).toBe(true);
    });
  });

  describe("invalid flags", () => {
    it("should return false for unknown flag characters", () => {
      expect(isValidRegExpFlags("x")).toBe(false);
    });

    it("should return false for duplicate flags", () => {
      expect(isValidRegExpFlags("gg")).toBe(false);
    });

    it("should return false for uppercase valid flag letters", () => {
      expect(isValidRegExpFlags("G")).toBe(false);
    });

    it("should return false for flags with spaces", () => {
      expect(isValidRegExpFlags("g i")).toBe(false);
    });

    it("should return false for duplicate flags mixed with valid ones", () => {
      expect(isValidRegExpFlags("gig")).toBe(false);
    });
  });
});

import { describe, it, expect } from "vitest";
import { getPageRange } from "./pagination";

describe("getPageRange", () => {
  describe("small page counts (show all pages)", () => {
    it("returns single page for maxPage=1", () => {
      expect(getPageRange(1, 1)).toEqual([1]);
    });

    it("returns two pages for maxPage=2", () => {
      expect(getPageRange(1, 2)).toEqual([1, 2]);
    });

    it("returns all pages when total is within threshold", () => {
      expect(getPageRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(getPageRange(3, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(getPageRange(5, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it("returns all pages at the threshold boundary", () => {
      // siblingCount=1 → totalSlots = 1*2+5 = 7
      expect(getPageRange(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(getPageRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe("near start (right ellipsis only)", () => {
    it("shows expanded left range when on first page", () => {
      const result = getPageRange(1, 10);
      expect(result[0]).toBe(1);
      expect(result).toContain("ellipsis");
      expect(result[result.length - 1]).toBe(10);
      // Should not have ellipsis at the start
      expect(result[1]).not.toBe("ellipsis");
    });

    it("shows expanded left range when on second page", () => {
      const result = getPageRange(2, 10);
      expect(result[0]).toBe(1);
      expect(result[result.length - 1]).toBe(10);
      expect(result).toContain("ellipsis");
      // Only one ellipsis (on the right)
      expect(result.filter((x) => x === "ellipsis")).toHaveLength(1);
    });
  });

  describe("near end (left ellipsis only)", () => {
    it("shows expanded right range when on last page", () => {
      const result = getPageRange(10, 10);
      expect(result[0]).toBe(1);
      expect(result[result.length - 1]).toBe(10);
      expect(result).toContain("ellipsis");
      // Only one ellipsis (on the left)
      expect(result.filter((x) => x === "ellipsis")).toHaveLength(1);
    });

    it("shows expanded right range when near last page", () => {
      const result = getPageRange(9, 10);
      expect(result[0]).toBe(1);
      expect(result[result.length - 1]).toBe(10);
      expect(result.filter((x) => x === "ellipsis")).toHaveLength(1);
    });
  });

  describe("middle (both ellipses)", () => {
    it("shows ellipsis on both sides for middle pages", () => {
      const result = getPageRange(5, 10);
      expect(result).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
    });

    it("shows correct siblings in the middle of large range", () => {
      const result = getPageRange(10, 20);
      expect(result).toEqual([1, "ellipsis", 9, 10, 11, "ellipsis", 20]);
    });
  });

  describe("custom siblingCount", () => {
    it("shows more siblings with siblingCount=2", () => {
      const result = getPageRange(5, 10, 2);
      expect(result).toEqual([1, "ellipsis", 3, 4, 5, 6, 7, "ellipsis", 10]);
    });

    it("shows all pages when siblingCount makes totalSlots >= maxPage", () => {
      // siblingCount=3 → totalSlots = 3*2+5 = 11, maxPage=10
      const result = getPageRange(5, 10, 3);
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  describe("edge cases", () => {
    it("handles maxPage < 1", () => {
      expect(getPageRange(1, 0)).toEqual([1]);
      expect(getPageRange(1, -1)).toEqual([1]);
    });

    it("clamps currentPage below 1 to valid range", () => {
      const result = getPageRange(0, 10);
      expect(result[0]).toBe(1);
      // Should behave like page 1
      expect(result).toEqual(getPageRange(1, 10));
    });

    it("clamps currentPage above maxPage to valid range", () => {
      const result = getPageRange(15, 10);
      // Should behave like page 10
      expect(result).toEqual(getPageRange(10, 10));
    });

    it("never contains duplicate consecutive values", () => {
      for (let page = 1; page <= 20; page++) {
        const result = getPageRange(page, 20);
        for (let i = 1; i < result.length; i++) {
          expect(result[i]).not.toBe(result[i - 1]);
        }
      }
    });

    it("always starts with 1 and ends with maxPage", () => {
      for (let page = 1; page <= 20; page++) {
        const result = getPageRange(page, 20);
        expect(result[0]).toBe(1);
        expect(result[result.length - 1]).toBe(20);
      }
    });

    it("always contains the current page", () => {
      for (let page = 1; page <= 20; page++) {
        const result = getPageRange(page, 20);
        expect(result).toContain(page);
      }
    });
  });
});

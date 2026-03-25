import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { getPageRange } from "./pagination";
import { Pagination } from "./pagination";
import {
  KUMO_PAGINATION_VARIANTS,
  KUMO_PAGINATION_DEFAULT_VARIANTS,
} from "./pagination";

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

describe("KUMO_PAGINATION_VARIANTS", () => {
  it("includes numbered variant in controls", () => {
    expect(KUMO_PAGINATION_VARIANTS.controls.numbered).toBeDefined();
    expect(KUMO_PAGINATION_VARIANTS.controls.numbered.description).toBe(
      "Numbered page buttons with previous and next navigation arrows",
    );
  });

  it("has correct default controls variant", () => {
    expect(KUMO_PAGINATION_DEFAULT_VARIANTS.controls).toBe("full");
  });
});

describe("Pagination with numbered controls", () => {
  const renderNumberedPagination = (props: {
    page: number;
    totalCount: number;
    perPage: number;
    setPage?: (page: number) => void;
  }) => {
    const setPage = props.setPage ?? (() => {});
    return render(
      <Pagination
        page={props.page}
        totalCount={props.totalCount}
        perPage={props.perPage}
        setPage={setPage}
      >
        <Pagination.Controls controls="numbered" />
      </Pagination>,
    );
  };

  it("renders page number buttons", () => {
    renderNumberedPagination({ page: 1, totalCount: 50, perPage: 10 });
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("renders previous and next buttons", () => {
    renderNumberedPagination({ page: 3, totalCount: 50, perPage: 10 });
    expect(screen.getByLabelText("Previous page")).toBeTruthy();
    expect(screen.getByLabelText("Next page")).toBeTruthy();
  });

  it("disables previous button on first page", () => {
    renderNumberedPagination({ page: 1, totalCount: 50, perPage: 10 });
    const prevButton = screen.getByLabelText("Previous page");
    expect(prevButton).toHaveProperty("disabled", true);
  });

  it("disables next button on last page", () => {
    renderNumberedPagination({ page: 5, totalCount: 50, perPage: 10 });
    const nextButton = screen.getByLabelText("Next page");
    expect(nextButton).toHaveProperty("disabled", true);
  });

  it("marks current page with aria-current", () => {
    renderNumberedPagination({ page: 3, totalCount: 50, perPage: 10 });
    const currentPageButton = screen.getByLabelText("Go to page 3");
    expect(currentPageButton.getAttribute("aria-current")).toBe("page");
  });

  it("does not mark non-current pages with aria-current", () => {
    renderNumberedPagination({ page: 3, totalCount: 50, perPage: 10 });
    const otherPageButton = screen.getByLabelText("Go to page 1");
    expect(otherPageButton.getAttribute("aria-current")).toBeNull();
  });

  it("calls setPage when clicking a page number", () => {
    const setPage = vi.fn();
    renderNumberedPagination({ page: 1, totalCount: 50, perPage: 10, setPage });
    fireEvent.click(screen.getByLabelText("Go to page 3"));
    expect(setPage).toHaveBeenCalledWith(3);
  });

  it("calls setPage when clicking next button", () => {
    const setPage = vi.fn();
    renderNumberedPagination({ page: 2, totalCount: 50, perPage: 10, setPage });
    fireEvent.click(screen.getByLabelText("Next page"));
    expect(setPage).toHaveBeenCalledWith(3);
  });

  it("calls setPage when clicking previous button", () => {
    const setPage = vi.fn();
    renderNumberedPagination({ page: 3, totalCount: 50, perPage: 10, setPage });
    fireEvent.click(screen.getByLabelText("Previous page"));
    expect(setPage).toHaveBeenCalledWith(2);
  });

  it("renders ellipsis for large page counts", () => {
    renderNumberedPagination({ page: 10, totalCount: 500, perPage: 10 });
    const ellipses = screen.getAllByText("…");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it("renders navigation landmark", () => {
    renderNumberedPagination({ page: 1, totalCount: 50, perPage: 10 });
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
  });

  it("supports siblingCount prop", () => {
    render(
      <Pagination page={10} totalCount={500} perPage={10} setPage={() => {}}>
        <Pagination.Controls controls="numbered" siblingCount={2} />
      </Pagination>,
    );
    // With siblingCount=2, pages 8,9,10,11,12 should be visible
    expect(screen.getByText("8")).toBeTruthy();
    expect(screen.getByText("9")).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
    expect(screen.getByText("11")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
  });
});

/**
 * Regression tests: every component's variant function must survive
 * invalid variant values without throwing.
 *
 * These tests pass a bogus string (cast via `as any`) to each dimension
 * of every variant function and assert it returns a value instead of
 * crashing with `TypeError: Cannot read properties of undefined`.
 */
import { describe, expect, it, vi } from "vitest";

// Suppress the expected dev warnings from resolveVariant
vi.spyOn(console, "warn").mockImplementation(() => {});

// ---------------------------------------------------------------------------
// Variant functions under test
// ---------------------------------------------------------------------------
import { buttonVariants } from "../components/button/button";
import { bannerVariants } from "../components/banner/banner";
import { textVariants } from "../components/text/text";
import { toastVariants } from "../components/toast/toast";
import { inputVariants } from "../components/input/input";
import { linkVariants } from "../components/link/link";
import { tooltipVariants } from "../components/tooltip/tooltip";
import { checkboxVariants } from "../components/checkbox/checkbox";
import { dropdownVariants } from "../components/dropdown/dropdown";
import { radioVariants } from "../components/radio/radio";
import { paginationVariants } from "../components/pagination/pagination";
import { dialogVariants } from "../components/dialog/dialog";
import { emptyVariants } from "../components/empty/empty";
import { breadcrumbsVariants } from "../components/breadcrumbs/breadcrumbs";
import { surfaceVariants } from "../components/surface/surface";
import { loaderVariants } from "../components/loader/loader";
import { comboboxVariants } from "../components/combobox/combobox";
import { gridVariants } from "../components/grid/grid";
import { clipboardTextVariants } from "../components/clipboard-text/clipboard-text";
import { autocompleteVariants } from "../components/autocomplete/autocomplete";
import { badgeVariants } from "../components/badge/badge";
import { codeVariants } from "../components/code/code";
import { switchVariants } from "../components/switch/switch";
import { selectVariants } from "../components/select/select";

const BOGUS = "this-variant-does-not-exist" as any;

describe("variant functions survive invalid variant values", () => {
  it("buttonVariants", () => {
    expect(() =>
      buttonVariants({ variant: BOGUS, size: BOGUS, shape: BOGUS }),
    ).not.toThrow();
    expect(typeof buttonVariants({ variant: BOGUS })).toBe("string");
  });

  it("bannerVariants", () => {
    expect(() => bannerVariants({ variant: BOGUS })).not.toThrow();
    expect(typeof bannerVariants({ variant: BOGUS })).toBe("string");
  });

  it("textVariants", () => {
    expect(() =>
      textVariants({ variant: BOGUS, size: BOGUS }),
    ).not.toThrow();
    expect(typeof textVariants({ variant: BOGUS })).toBe("string");
  });

  it("toastVariants", () => {
    expect(() => toastVariants({ variant: BOGUS })).not.toThrow();
    expect(typeof toastVariants({ variant: BOGUS })).toBe("string");
  });

  it("inputVariants", () => {
    expect(() =>
      inputVariants({ variant: BOGUS, size: BOGUS }),
    ).not.toThrow();
    expect(typeof inputVariants({ variant: BOGUS })).toBe("string");
  });

  it("linkVariants", () => {
    expect(() => linkVariants({ variant: BOGUS })).not.toThrow();
    expect(typeof linkVariants({ variant: BOGUS })).toBe("string");
  });

  it("tooltipVariants", () => {
    expect(() => tooltipVariants({ side: BOGUS })).not.toThrow();
    expect(typeof tooltipVariants({ side: BOGUS })).toBe("string");
  });

  it("checkboxVariants", () => {
    expect(() => checkboxVariants({ variant: BOGUS })).not.toThrow();
    expect(typeof checkboxVariants({ variant: BOGUS })).toBe("string");
  });

  it("dropdownVariants", () => {
    expect(() => dropdownVariants({ variant: BOGUS })).not.toThrow();
    expect(typeof dropdownVariants({ variant: BOGUS })).toBe("string");
  });

  it("radioVariants", () => {
    expect(() =>
      radioVariants({ variant: BOGUS, appearance: BOGUS }),
    ).not.toThrow();
    expect(typeof radioVariants({ variant: BOGUS })).toBe("string");
  });

  it("paginationVariants", () => {
    expect(() => paginationVariants({ controls: BOGUS })).not.toThrow();
    expect(typeof paginationVariants({ controls: BOGUS })).toBe("string");
  });

  it("dialogVariants", () => {
    expect(() => dialogVariants({ size: BOGUS })).not.toThrow();
    expect(typeof dialogVariants({ size: BOGUS })).toBe("string");
  });

  it("emptyVariants", () => {
    expect(() => emptyVariants({ size: BOGUS })).not.toThrow();
    expect(typeof emptyVariants({ size: BOGUS })).toBe("string");
  });

  it("breadcrumbsVariants", () => {
    expect(() => breadcrumbsVariants({ size: BOGUS })).not.toThrow();
    expect(typeof breadcrumbsVariants({ size: BOGUS })).toBe("string");
  });

  it("surfaceVariants", () => {
    expect(() => surfaceVariants({ color: BOGUS })).not.toThrow();
    expect(typeof surfaceVariants({ color: BOGUS })).toBe("string");
  });

  it("loaderVariants", () => {
    expect(() => loaderVariants({ size: BOGUS })).not.toThrow();
    expect(typeof loaderVariants({ size: BOGUS })).toBe("number");
  });

  it("comboboxVariants", () => {
    expect(() => comboboxVariants({ inputSide: BOGUS })).not.toThrow();
    expect(typeof comboboxVariants({ inputSide: BOGUS })).toBe("string");
  });

  it("gridVariants", () => {
    expect(() =>
      gridVariants({ variant: BOGUS, gap: BOGUS }),
    ).not.toThrow();
    expect(typeof gridVariants({ variant: BOGUS })).toBe("string");
  });

  it("clipboardTextVariants", () => {
    expect(() => clipboardTextVariants({ size: BOGUS })).not.toThrow();
    expect(typeof clipboardTextVariants({ size: BOGUS })).toBe("string");
  });

  it("autocompleteVariants", () => {
    expect(() => autocompleteVariants({ size: BOGUS })).not.toThrow();
    expect(typeof autocompleteVariants({ size: BOGUS })).toBe("string");
  });

  it("badgeVariants", () => {
    expect(() =>
      badgeVariants({ variant: BOGUS, appearance: BOGUS }),
    ).not.toThrow();
    expect(typeof badgeVariants({ variant: BOGUS })).toBe("string");
    expect(typeof badgeVariants({ appearance: BOGUS })).toBe("string");
  });

  it("codeVariants", () => {
    expect(() => codeVariants({ lang: BOGUS })).not.toThrow();
    expect(typeof codeVariants({ lang: BOGUS })).toBe("string");
  });

  it("switchVariants", () => {
    expect(() =>
      switchVariants({ size: BOGUS, variant: BOGUS }),
    ).not.toThrow();
    expect(typeof switchVariants({ size: BOGUS })).toBe("string");
  });

  it("selectVariants", () => {
    expect(() => selectVariants({ size: BOGUS })).not.toThrow();
    expect(typeof selectVariants({ size: BOGUS })).toBe("string");
  });
});

describe("variant functions return default classes for invalid values", () => {
  it("buttonVariants with invalid variant returns same as default", () => {
    const defaultResult = buttonVariants();
    const invalidResult = buttonVariants({
      variant: BOGUS,
      size: BOGUS,
      shape: BOGUS,
    });
    // Both should produce a non-empty string (the default classes)
    expect(defaultResult).toBeTruthy();
    expect(invalidResult).toBe(defaultResult);
  });

  it("bannerVariants with invalid variant returns same as default", () => {
    expect(bannerVariants({ variant: BOGUS })).toBe(bannerVariants());
  });

  it("inputVariants with invalid size returns same as default", () => {
    expect(inputVariants({ size: BOGUS })).toBe(inputVariants());
  });

  it("loaderVariants with invalid size returns default pixel value", () => {
    expect(loaderVariants({ size: BOGUS })).toBe(loaderVariants());
  });
});

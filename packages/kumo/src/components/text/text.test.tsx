import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { render } from "@testing-library/react";
import { Text } from "./text";

describe("Text", () => {
  it("renders display variant with the required `as` element", () => {
    const { container } = render(
      <Text variant="display" as="h1">
        Welcome
      </Text>,
    );
    expect(container.querySelector("h1")).toBeTruthy();
  });

  it("renders page-title variant", () => {
    const { container } = render(
      <Text variant="page-title" as="h1">
        Account settings
      </Text>,
    );
    expect(container.querySelector("h1")).toBeTruthy();
    expect(container.querySelector("h1")?.className).toContain("text-xl");
  });

  it("renders section-title variant", () => {
    const { container } = render(
      <Text variant="section-title" as="h2">
        General
      </Text>,
    );
    expect(container.querySelector("h2")).toBeTruthy();
    expect(container.querySelector("h2")?.className).toContain("text-lg");
  });

  it("renders heading variant (the small inline one)", () => {
    const { container } = render(
      <Text variant="heading" as="h3">
        API tokens
      </Text>,
    );
    const el = container.querySelector("h3");
    expect(el).toBeTruthy();
    expect(el?.className).toContain("text-base");
    expect(el?.className).toContain("font-medium");
  });

  it("renders body variant as <p> by default", () => {
    const { container } = render(<Text>Body copy</Text>);
    expect(container.querySelector("p")).toBeTruthy();
  });

  it("body variant supports optional `as` override", () => {
    const { container } = render(
      <Text variant="body" as="span">
        Inline body
      </Text>,
    );
    expect(container.querySelector("span")).toBeTruthy();
    expect(container.querySelector("p")).toBeNull();
  });

  it("allows heading variants to opt out of semantic heading via as='span'", () => {
    const { container } = render(
      <Text variant="page-title" as="span">
        Decorative big text
      </Text>,
    );
    expect(container.querySelector("span")).toBeTruthy();
    expect(container.querySelector("h2")).toBeNull();
  });

  it("renders as <dt> when as='dt'", () => {
    const { container } = render(<Text as="dt">Term</Text>);
    expect(container.querySelector("dt")).toBeTruthy();
    expect(container.querySelector("p")).toBeNull();
  });

  it("renders as <dd> when as='dd'", () => {
    const { container } = render(<Text as="dd">Definition</Text>);
    expect(container.querySelector("dd")).toBeTruthy();
  });

  it("renders as <label> when as='label'", () => {
    const { container } = render(<Text as="label">Label</Text>);
    expect(container.querySelector("label")).toBeTruthy();
  });

  it("renders as <code> when as='code'", () => {
    const { container } = render(
      <Text variant="mono" as="code">
        const x = 1
      </Text>,
    );
    expect(container.querySelector("code")).toBeTruthy();
  });

  it("renders as <pre> when as='pre'", () => {
    const { container } = render(
      <Text variant="mono" as="pre">
        preformatted
      </Text>,
    );
    expect(container.querySelector("pre")).toBeTruthy();
  });

  describe("deprecated heading aliases", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it("heading1 still renders (same classes as display) and warns", () => {
      const { container } = render(
        <Text variant="heading1" as="h1">
          Legacy
        </Text>,
      );
      const el = container.querySelector("h1");
      expect(el).toBeTruthy();
      expect(el?.className).toContain("text-2xl");
      expect(el?.className).toContain("font-semibold");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('variant="heading1" is deprecated'),
      );
    });

    it("heading2 warns and maps to page-title classes", () => {
      const { container } = render(
        <Text variant="heading2" as="h2">
          Legacy
        </Text>,
      );
      const el = container.querySelector("h2");
      expect(el?.className).toContain("text-xl");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("page-title"),
      );
    });

    it("heading3 warns and maps to section-title classes", () => {
      const { container } = render(
        <Text variant="heading3" as="h3">
          Legacy
        </Text>,
      );
      const el = container.querySelector("h3");
      expect(el?.className).toContain("text-lg");
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("section-title"),
      );
    });
  });

  describe("bold prop", () => {
    it("applies font-medium on default body variant", () => {
      const { container } = render(<Text bold>Bumped</Text>);
      expect(container.querySelector("p")?.className).toContain("font-medium");
    });

    it("applies font-medium on secondary variant", () => {
      const { container } = render(
        <Text variant="secondary" bold>
          Bumped
        </Text>,
      );
      expect(container.querySelector("p")?.className).toContain("font-medium");
    });

    it("does not apply font-medium when bold is falsy", () => {
      const { container } = render(<Text>Plain</Text>);
      expect(container.querySelector("p")?.className).not.toContain(
        "font-medium",
      );
    });
  });

  // Type-level enforcement of the required `as` prop for heading variants
  // lives in `text.type-spec.tsx`. That file is included in the regular
  // tsconfig glob, so `pnpm typecheck` evaluates every `@ts-expect-error`
  // directive and fails if the type contract is broken. Vitest test files
  // are excluded from tsc, so `@ts-expect-error` is not effective here.
});

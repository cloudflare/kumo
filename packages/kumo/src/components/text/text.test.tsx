import { describe, expect, it, vi } from "vite-plus/test";
import { render } from "@testing-library/react";
import { Text, textVariants } from "./text";

describe("Text", () => {
  it("renders heading as a 16px semibold span by default", () => {
    const { container } = render(<Text variant="heading">Heading</Text>);
    const heading = container.querySelector("span");

    expect(heading).toBeTruthy();
    expect(heading?.classList.contains("text-lg")).toBe(true);
    expect(heading?.classList.contains("font-semibold")).toBe(true);
    expect(container.querySelector("h1, h2, h3, h4, h5, h6")).toBeNull();
  });

  it("renders a large heading at 20px using the requested element", () => {
    const { container } = render(
      <Text variant="heading" size="lg" as="h2">
        Section title
      </Text>,
    );
    const heading = container.querySelector("h2");

    expect(heading).toBeTruthy();
    expect(heading?.classList.contains("text-xl")).toBe(true);
    expect(heading?.classList.contains("font-semibold")).toBe(true);
  });

  it("warns when a deprecated heading variant is used", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <Text variant="heading1" as="h1">
        Legacy heading
      </Text>,
    );

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('variant="heading1" is deprecated'),
    );
    warn.mockRestore();
  });

  it("renders body variant as <p> by default", () => {
    const { container } = render(<Text>Body copy</Text>);
    expect(container.querySelector("p")).toBeTruthy();
  });

  it("inherits line height for every body font size", () => {
    expect(textVariants({ variant: "body", size: "xs" })).toContain(
      "text-xs/[inherit]",
    );
    expect(textVariants({ variant: "body", size: "sm" })).toContain(
      "text-sm/[inherit]",
    );
    expect(textVariants({ variant: "body", size: "base" })).toContain(
      "text-base/[inherit]",
    );
    expect(textVariants({ variant: "body", size: "lg" })).toContain(
      "text-lg/[inherit]",
    );
    expect(textVariants({ variant: "secondary" })).toContain(
      "text-base/[inherit]",
    );
    expect(textVariants({ variant: "success" })).toContain(
      "text-base/[inherit]",
    );
    expect(textVariants({ variant: "error" })).toContain("text-base/[inherit]");
    expect(textVariants({ variant: "mono" })).toContain("text-sm/[inherit]");
    expect(textVariants({ variant: "mono-secondary" })).toContain(
      "text-sm/[inherit]",
    );
  });

  it("keeps the configured line height for heading variants", () => {
    expect(textVariants({ variant: "heading" }).split(" ")).toContain(
      "text-lg",
    );
    expect(
      textVariants({ variant: "heading", size: "lg" }).split(" "),
    ).toContain("text-xl");
    expect(textVariants({ variant: "heading1" }).split(" ")).toContain(
      "text-3xl",
    );
    expect(textVariants({ variant: "heading2" }).split(" ")).toContain(
      "text-2xl",
    );
    expect(textVariants({ variant: "heading3" }).split(" ")).toContain(
      "text-lg",
    );
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

  it("allows heading to opt out of semantic heading via as='span'", () => {
    const { container } = render(
      <Text variant="heading" as="span">
        Decorative heading text
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

  // Type-level enforcement of the required `as` prop for heading variants
  // lives in `text.type-spec.tsx`. That file is included in the regular
  // tsconfig glob, so `pnpm typecheck` evaluates every `@ts-expect-error`
  // directive and fails if the type contract is broken. Vitest test files
  // are excluded from tsc, so `@ts-expect-error` is not effective here.
});

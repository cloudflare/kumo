import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Text } from "./text";

describe("Text", () => {
  it("renders heading variant with the required `as` element", () => {
    const { container } = render(
      <Text variant="heading1" as="h1">
        Page Title
      </Text>,
    );
    expect(container.querySelector("h1")).toBeTruthy();
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
      <Text variant="heading2" as="span">
        Decorative big text
      </Text>,
    );
    expect(container.querySelector("span")).toBeTruthy();
    expect(container.querySelector("h2")).toBeNull();
  });

  // Type-level enforcement of the required `as` prop for heading variants
  // lives in `text.type-spec.tsx`. That file is included in the regular
  // tsconfig glob, so `pnpm typecheck` evaluates every `@ts-expect-error`
  // directive and fails if the type contract is broken. Vitest test files
  // are excluded from tsc, so `@ts-expect-error` is not effective here.
});

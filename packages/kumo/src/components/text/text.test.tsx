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

  // Type-level: the below should fail to compile when `as` is missing from a
  // heading variant. We can't runtime-assert TypeScript errors, but an
  // @ts-expect-error directive confirms the discriminated union is enforcing
  // the requirement (deleting the directive would produce a compile error,
  // which in turn would be caught by `tsc --noEmit`).
  it("type-enforces `as` on heading variants", () => {
    // @ts-expect-error — heading variants require `as`
    const InvalidHeading = <Text variant="heading1">Missing `as`</Text>;
    // Use the variable so it doesn't get tree-shaken out of the test body.
    expect(InvalidHeading).toBeTruthy();
  });
});

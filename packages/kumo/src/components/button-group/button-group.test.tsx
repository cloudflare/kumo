import { describe, it, expect } from "vite-plus/test";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { ButtonGroup } from "./button-group";
import { Button } from "../button/button";

describe("ButtonGroup", () => {
  it("should be importable", () => {
    expect(ButtonGroup).toBeDefined();
  });

  it("should have correct display name", () => {
    expect(ButtonGroup.displayName).toBe("ButtonGroup");
  });

  it("renders its children", () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    );
    expect(screen.getByText("One")).toBeTruthy();
    expect(screen.getByText("Two")).toBeTruthy();
  });

  it('defaults to role="group"', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toBeTruthy();
  });

  it("forwards aria-label to the group", () => {
    render(
      <ButtonGroup aria-label="Deploy">
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group", { name: "Deploy" })).toBeTruthy();
  });

  it('does not allow role="group" to be overridden', () => {
    const props = { role: "toolbar" };
    render(
      <ButtonGroup {...props}>
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toBeTruthy();
    expect(screen.queryByRole("toolbar")).toBeNull();
  });

  it("lays buttons out horizontally", () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group").className).toContain("flex-row");
  });

  it("ignores non-control siblings mounted by an open overlay", () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
        <span data-portal-placeholder="" />
      </ButtonGroup>,
    );
    expect(screen.getByRole("group").className).toContain(
      "[&>*:is(button,a):has(~_:is(button,a))]:rounded-e-none",
    );
  });

  it("uses logical child-position selectors to join controls", () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <a href="/two">Two</a>
      </ButtonGroup>,
    );
    const className = screen.getByRole("group").className;
    expect(className).toContain("rounded-s-none");
    expect(className).toContain("rounded-e-none");
    expect(className).toContain("-ms-px");
    expect(className).not.toContain("!ring-kumo-line");
  });

  it("merges a custom className", () => {
    render(
      <ButtonGroup className="custom-class">
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group").className).toContain("custom-class");
  });

  it("forwards a ref to the container", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ButtonGroup ref={ref}>
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
